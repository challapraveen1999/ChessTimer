package com.chesstimmer

import android.media.AudioManager
import android.media.ToneGenerator
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BeepModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var toneGenerator: ToneGenerator? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getName(): String {
        return "Beep"
    }

    @ReactMethod
    fun play(toneType: String, durationMs: Int) {
        try {
            if (toneGenerator == null) {
                toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
            }
            val tone = when (toneType) {
                "click" -> ToneGenerator.TONE_PROP_BEEP
                "warning" -> ToneGenerator.TONE_PROP_BEEP2
                "critical" -> ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD
                "alarm" -> ToneGenerator.TONE_SUP_ERROR
                "pulse" -> ToneGenerator.TONE_PROP_ACK
                else -> ToneGenerator.TONE_PROP_BEEP
            }
            val dur = if (durationMs > 0) durationMs else 100
            toneGenerator?.startTone(tone, dur)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
