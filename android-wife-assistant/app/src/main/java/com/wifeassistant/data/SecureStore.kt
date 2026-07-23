package com.wifeassistant.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

// تخزين مشفّر لمفتاح Groq (Android Keystore + EncryptedSharedPreferences).
// لو التشفير غير متاح: بنرمي خطأ بدل ما نكتب المفتاح نص صريح بصمت —
// التخزين غير المشفّر يُقرأ فقط كترحيل من نسخ قديمة، ولا يُكتب أبداً.
object SecureStore {
    private const val LEGACY_PREFS = "wife_assistant_settings"
    private const val KEY = "groqKey"

    private fun secure(context: Context): SharedPreferences? = try {
        val master = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "wisal_secure",
            master,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    } catch (e: Exception) {
        null
    }

    private fun legacy(context: Context): SharedPreferences =
        context.getSharedPreferences(LEGACY_PREFS, Context.MODE_PRIVATE)

    fun getGroqKey(context: Context): String {
        secure(context)?.getString(KEY, null)?.let { return it }
        // احتياطي: النسخة القديمة غير المشفّرة.
        return legacy(context).getString(KEY, "").orEmpty()
    }

    fun setGroqKey(context: Context, value: String) {
        val enc = secure(context)
            ?: throw IllegalStateException("التخزين المشفّر غير متاح — لن يُحفظ المفتاح نصاً صريحاً")
        enc.edit().putString(KEY, value).apply()
        // نمسح النسخة القديمة غير المشفّرة لو موجودة (ترحيل آمن).
        legacy(context).edit().remove(KEY).apply()
    }
}
