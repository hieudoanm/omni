package io.github.hieudoanm.nfc.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import io.github.hieudoanm.nfc.data.database.AppDatabase
import io.github.hieudoanm.nfc.data.database.TagHistoryDao
import io.github.hieudoanm.nfc.data.database.TagProfileDao
import io.github.hieudoanm.nfc.data.nfc.NdefWriter
import io.github.hieudoanm.nfc.data.preferences.SettingsDataStore
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "nfc_toolkit.db"
        ).build()
    }

    @Provides
    fun provideTagHistoryDao(database: AppDatabase): TagHistoryDao = database.tagHistoryDao()

    @Provides
    fun provideTagProfileDao(database: AppDatabase): TagProfileDao = database.tagProfileDao()

    @Provides
    @Singleton
    fun provideSettingsDataStore(@ApplicationContext context: Context): SettingsDataStore {
        return SettingsDataStore(context)
    }
}
