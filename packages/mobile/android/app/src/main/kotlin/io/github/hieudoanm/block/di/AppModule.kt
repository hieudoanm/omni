package io.github.hieudoanm.block.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.database.FocusDatabase
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideFocusDatabase(@ApplicationContext context: Context): FocusDatabase {
        return Room.databaseBuilder(
            context,
            FocusDatabase::class.java,
            "focus_blocker.db"
        ).build()
    }

    @Provides
    fun provideAppDao(database: FocusDatabase): AppDao = database.appDao()

    @Provides
    @Singleton
    fun provideSettingsDataStore(@ApplicationContext context: Context): SettingsDataStore {
        return SettingsDataStore(context)
    }
}
