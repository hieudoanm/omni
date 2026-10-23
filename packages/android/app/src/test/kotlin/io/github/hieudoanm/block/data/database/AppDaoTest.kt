package io.github.hieudoanm.block.data.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import io.github.hieudoanm.block.data.entity.BlockedApp
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class AppDaoTest {
    private lateinit var database: FocusDatabase
    private lateinit var dao: AppDao

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, FocusDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        dao = database.appDao()
    }

    @After
    fun teardown() {
        database.close()
    }

    @Test
    fun `insert and retrieve blocked app`() = runTest {
        val app = BlockedApp("com.example.app", "Example App")
        dao.upsertBlockedApp(app)

        val result = dao.getBlockedApp("com.example.app")
        assertEquals("Example App", result?.label)
        assertTrue(result?.enabled == true)
    }

    @Test
    fun `insert replaces existing app`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.app", "Original"))
        dao.upsertBlockedApp(BlockedApp("com.example.app", "Updated"))

        val result = dao.getBlockedApp("com.example.app")
        assertEquals("Updated", result?.label)
    }

    @Test
    fun `remove blocked app`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.app", "Example"))
        dao.removeBlockedApp("com.example.app")

        assertNull(dao.getBlockedApp("com.example.app"))
    }

    @Test
    fun `isBlocked returns true for enabled app`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.app", "Example", enabled = true))
        assertTrue(dao.isBlocked("com.example.app"))
    }

    @Test
    fun `isBlocked returns false for disabled app`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.app", "Example", enabled = false))
        assertFalse(dao.isBlocked("com.example.app"))
    }

    @Test
    fun `isBlocked returns false for non-existent app`() = runTest {
        assertFalse(dao.isBlocked("com.example.nonexistent"))
    }

    @Test
    fun `observeAllBlockedApps returns alphabetical order`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.z", "Zebra"))
        dao.upsertBlockedApp(BlockedApp("com.example.a", "Alpha"))
        dao.upsertBlockedApp(BlockedApp("com.example.m", "Mike"))

        val apps = dao.observeAllBlockedApps().first()
        assertEquals("Alpha", apps[0].label)
        assertEquals("Mike", apps[1].label)
        assertEquals("Zebra", apps[2].label)
    }

    @Test
    fun `observeEnabledBlockedApps returns only enabled`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.a", "A", enabled = true))
        dao.upsertBlockedApp(BlockedApp("com.example.b", "B", enabled = false))
        dao.upsertBlockedApp(BlockedApp("com.example.c", "C", enabled = true))

        val apps = dao.observeEnabledBlockedApps().first()
        assertEquals(2, apps.size)
        assertTrue(apps.all { it.enabled })
    }

    @Test
    fun `observeBlockedAppCount returns correct count`() = runTest {
        dao.upsertBlockedApp(BlockedApp("com.example.a", "A", enabled = true))
        dao.upsertBlockedApp(BlockedApp("com.example.b", "B", enabled = false))
        dao.upsertBlockedApp(BlockedApp("com.example.c", "C", enabled = true))

        val count = dao.observeBlockedAppCount().first()
        assertEquals(2, count)
    }

    @Test
    fun `empty database returns empty lists`() = runTest {
        assertTrue(dao.observeAllBlockedApps().first().isEmpty())
        assertTrue(dao.observeEnabledBlockedApps().first().isEmpty())
        assertEquals(0, dao.observeBlockedAppCount().first())
    }
}
