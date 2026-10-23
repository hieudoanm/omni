package io.github.hieudoanm.block.di

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import io.github.hieudoanm.block.data.database.FocusDatabase
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertNotNull

@RunWith(RobolectricTestRunner::class)
class AppModuleTest {
    private val module = AppModule
    private val context = ApplicationProvider.getApplicationContext<Context>()

    @Test
    fun `provideFocusDatabase creates database`() {
        val db = module.provideFocusDatabase(context)
        assertNotNull(db)
        db.close()
    }

    @Test
    fun `provideAppDao creates dao`() {
        val db = module.provideFocusDatabase(context)
        val dao = module.provideAppDao(db)
        assertNotNull(dao)
        db.close()
    }

    @Test
    fun `provideSettingsDataStore creates datastore`() {
        val dataStore = module.provideSettingsDataStore(context)
        assertNotNull(dataStore)
    }
}
