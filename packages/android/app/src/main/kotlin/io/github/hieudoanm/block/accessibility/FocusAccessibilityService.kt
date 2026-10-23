package io.github.hieudoanm.block.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.view.accessibility.AccessibilityEvent
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.block.activity.BlockActivity
import io.github.hieudoanm.block.repository.FocusRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FocusAccessibilityService : AccessibilityService() {

    @Inject
    lateinit var repository: FocusRepository

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var previousPackage: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 0
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        if (packageName == previousPackage) return
        previousPackage = packageName

        if (shouldIgnore(packageName)) return

        scope.launch {
            if (repository.isBlocked(packageName)) {
                repository.setLastBlockedTime(System.currentTimeMillis())
                launchBlockActivity(packageName)
            }
        }
    }

    override fun onInterrupt() {}

    private fun shouldIgnore(packageName: String): Boolean {
        return packageName == "io.github.hieudoanm.block" ||
            packageName.startsWith("com.android.systemui") ||
            packageName.startsWith("com.google.android.permissioncontroller") ||
            packageName.startsWith("com.android.launcher")
    }

    private fun launchBlockActivity(packageName: String) {
        val intent = android.content.Intent(this, BlockActivity::class.java).apply {
            addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra(BlockActivity.EXTRA_PACKAGE_NAME, packageName)
        }
        startActivity(intent)
    }
}
