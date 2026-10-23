package io.github.hieudoanm.block.data.entity

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ScheduleTest {
    @Test
    fun `autoGenerate id defaults to 0`() {
        val schedule = Schedule(
            packageName = "com.example.app",
            startTimeMillis = 1000L,
            endTimeMillis = 2000L,
            daysOfWeek = 0b1111111,
        )
        assertEquals(0L, schedule.id)
    }

    @Test
    fun `default enabled is true`() {
        val schedule = Schedule(
            packageName = "com.example.app",
            startTimeMillis = 1000L,
            endTimeMillis = 2000L,
            daysOfWeek = 0b1111111,
        )
        assertTrue(schedule.enabled)
    }
}
