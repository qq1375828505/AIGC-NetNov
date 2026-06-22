package com.ai.assistance.operit.core.application

import android.app.Activity
import android.app.Application
import android.os.Bundle

/**
 * Stub implementation of ActivityLifecycleManager.
 * This is a placeholder to allow compilation without the actual implementation.
 */
object ActivityLifecycleManager : Application.ActivityLifecycleCallbacks {
    
    private var currentActivity: Activity? = null
    
    fun getCurrentActivity(): Activity? = currentActivity
    
    fun register(application: Application) {
        application.registerActivityLifecycleCallbacks(this)
    }
    
    fun unregister(application: Application) {
        application.unregisterActivityLifecycleCallbacks(this)
    }
    
    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        currentActivity = activity
    }
    
    override fun onActivityStarted(activity: Activity) {}
    
    override fun onActivityResumed(activity: Activity) {
        currentActivity = activity
    }
    
    override fun onActivityPaused(activity: Activity) {}
    
    override fun onActivityStopped(activity: Activity) {}
    
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    
    override fun onActivityDestroyed(activity: Activity) {
        if (currentActivity == activity) {
            currentActivity = null
        }
    }
}
