package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File

// المخزن المحلي (JSON) - نظير store.js. بيحفظ التعلّم وثبات الحالة.
class Store(context: Context) {
    private val file = File(context.filesDir, "store.json")
    private val json = Json { prettyPrint = true; ignoreUnknownKeys = true; encodeDefaults = true }

    @Synchronized
    fun read(): AppData {
        if (!file.exists()) return defaultData()
        return runCatching { json.decodeFromString<AppData>(file.readText()) }.getOrElse {
            // ملف تالف ≠ مسح التعلّم بصمت: بنحجره جنباً ونبدأ نظيف.
            runCatching { file.renameTo(File(file.parentFile, "store.json.corrupt-${System.currentTimeMillis()}")) }
            defaultData()
        }
    }

    @Synchronized
    fun write(data: AppData) {
        // كتابة ذرّية: ملف مؤقّت ثم rename، عشان انقطاع الكتابة ما يبوّظش المخزن.
        val tmp = File(file.parentFile, "store.json.tmp")
        tmp.writeText(json.encodeToString(data))
        if (!tmp.renameTo(file)) {
            file.delete()
            tmp.renameTo(file)
        }
    }

    private fun defaultData(): AppData {
        val weights = AppConstants.THEMES.associateWith { 1.0 }.toMutableMap()
        return AppData(themeWeights = weights)
    }

    // ---- ملف الأسلوب (آخر 30 لكل شخص على حدة) ----
    fun styleExamples(recipientId: String): List<StyleExample> =
        read().styleExamples.filter { it.recipientId == recipientId }

    fun styleExamplesCount(): Int = read().styleExamples.size

    @Synchronized
    fun addStyleExample(text: String, theme: String?, recipientId: String) {
        val d = read()
        d.styleExamples.add(StyleExample(text.trim(), theme, DateUtil.todayISO(), recipientId))
        // السقف لكل شخص لوحده (الأقدم لنفس الشخص يخرج).
        while (d.styleExamples.count { it.recipientId == recipientId } > AppConstants.STYLE_EXAMPLES_MAX) {
            val idx = d.styleExamples.indexOfFirst { it.recipientId == recipientId }
            if (idx >= 0) d.styleExamples.removeAt(idx) else break
        }
        write(d)
    }

    // ---- أوزان المواضيع (ترجيح) ----
    fun themeWeights(): Map<String, Double> = read().themeWeights

    @Synchronized
    fun bumpThemeWeight(theme: String?, delta: Double) {
        if (theme == null) return
        val d = read()
        var next = (d.themeWeights[theme] ?: 1.0) + delta
        next = next.coerceIn(0.2, 5.0)
        d.themeWeights[theme] = next
        write(d)
    }

    fun recentThemes(days: Long): Set<String> {
        val cutoff = DateUtil.daysAgoISO(days)
        return read().feedback.filter { it.date >= cutoff }.flatMap { it.themesShown }.toSet()
    }

    // ---- تغذية راجعة ----
    @Synchronized
    fun addFeedback(fb: Feedback) {
        val d = read(); d.feedback.add(fb); write(d)
    }

    fun feedback(): List<Feedback> = read().feedback

    // حذف عنصر من السجل (بمطابقة التاريخ والنص).
    @Synchronized
    fun deleteHistory(date: String, text: String) {
        val d = read()
        d.feedback.removeAll { it.date == date && it.finalText == text }
        write(d)
    }

    // ---- المفضّلة ----
    fun favorites(): List<String> = read().favorites
    fun isFavorite(text: String): Boolean = read().favorites.contains(text)

    @Synchronized
    fun toggleFavorite(text: String) {
        val d = read()
        if (!d.favorites.remove(text)) d.favorites.add(text)
        write(d)
    }

    // ---- ثبات الحالة (مش نفس الخانة مرتين/يوم) ----
    fun wasSlotSentToday(slot: String): Boolean = read().lastSentPerSlot[slot] == DateUtil.todayISO()

    @Synchronized
    fun markSlotSentToday(slot: String) {
        val d = read(); d.lastSentPerSlot[slot] = DateUtil.todayISO(); write(d)
    }

    // ---- تذكيرات التواصل ("بقالك فترة ما كلّمت فلان") ----
    @Synchronized
    fun markContacted(recipientId: String) {
        if (recipientId.isBlank()) return
        val d = read(); d.lastContactedPerRecipient[recipientId] = DateUtil.todayISO(); write(d)
    }

    // عدد الأيام من آخر تواصل، أو null لو مفيش تواصل قبل كده.
    fun daysSinceContact(recipientId: String): Long? {
        val last = read().lastContactedPerRecipient[recipientId] ?: return null
        return runCatching {
            java.time.temporal.ChronoUnit.DAYS.between(
                java.time.LocalDate.parse(last),
                DateUtil.today(),
            )
        }.getOrNull()
    }

    // ---- الجولة المعلّقة (بين الإشعار والواجهة) ----
    fun getPending(): PendingRound? = read().pending

    @Synchronized
    fun setPending(p: PendingRound) {
        val d = read(); d.pending = p; write(d)
    }

    @Synchronized
    fun clearPending() {
        val d = read(); d.pending = null; write(d)
    }

    // ---- تصفير التعلّم (بيحافظ على lastSentPerSlot) ----
    @Synchronized
    fun resetLearning() {
        val old = read()
        val fresh = defaultData()
        fresh.lastSentPerSlot.putAll(old.lastSentPerSlot)
        write(fresh)
    }
}
