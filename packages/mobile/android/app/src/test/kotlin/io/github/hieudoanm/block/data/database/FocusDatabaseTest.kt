package io.github.hieudoanm.block.data.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import io.github.hieudoanm.block.data.entity.BlockedApp
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(RobolectricTestRunner::class)
class FocusDatabaseTest {
    private lateinit var database: FocusDatabase

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, FocusDatabase::class.java).build()
    }

    @After
    fun teardown() {
        database.close()
    }

    @Test
    fun `database is created successfully`() {
        assertNotNull(database)
    }

    @Test
    fun `appDao is provided`() {
        assertNotNull(database.appDao())
    }

    @Test
    fun `database can insert and query blocked app`() = runTest {
        val dao = database.appDao()
        val app = BlockedApp(packageName = "com.test", label = "Test App")
        dao.upsertBlockedApp(app)
        val result = dao.getBlockedApp("com.test")
        assertEquals("Test App", result?.label)
    }
}
