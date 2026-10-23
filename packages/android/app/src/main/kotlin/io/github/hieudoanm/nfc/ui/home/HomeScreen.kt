package io.github.hieudoanm.nfc.ui.home

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Nfc

import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.github.hieudoanm.nfc.domain.model.NdefRecordModel
import io.github.hieudoanm.nfc.domain.model.TagInfo

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToHistory: () -> Unit,
    onNavigateToSettings: () -> Unit,
    nfcSupported: Boolean = true,
    nfcEnabled: Boolean = true,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("NFC Toolkit") },
                actions = {
                    IconButton(onClick = onNavigateToHistory) {
                        Icon(Icons.Default.History, contentDescription = "History")
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            NfcStatusBanner(nfcSupported = nfcSupported, nfcEnabled = nfcEnabled)

            when (val s = state) {
                is HomeUiState.WaitingForTag -> WaitingForTagContent()
                is HomeUiState.Reading -> ReadingContent()
                is HomeUiState.Success -> TagResultContent(s.tagInfo, onDismiss = { viewModel.resetState() })
                is HomeUiState.Error -> ErrorContent(s.message, onRetry = { viewModel.resetState() })
            }
        }
    }
}

@Composable
private fun NfcStatusBanner(nfcSupported: Boolean, nfcEnabled: Boolean) {
    if (!nfcSupported) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFB71C1C), RoundedCornerShape(8.dp))
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Default.Nfc,
                contentDescription = null,
                tint = Color.White,
            )
            Spacer(modifier = Modifier.padding(end = 8.dp))
            Text("NFC not available on this device", color = Color.White)
        }
        Spacer(modifier = Modifier.height(8.dp))
    } else if (!nfcEnabled) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFE65100), RoundedCornerShape(8.dp))
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Default.Nfc,
                contentDescription = null,
                tint = Color.White,
            )
            Spacer(modifier = Modifier.padding(end = 8.dp))
            Text("NFC is disabled. Enable it in Settings.", color = Color.White)
        }
        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun WaitingForTagContent() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse_alpha",
    )

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = Icons.Default.Nfc,
            contentDescription = null,
            modifier = Modifier.size(96.dp).alpha(alpha),
            tint = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "Tap a Tag",
            style = MaterialTheme.typography.headlineMedium,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Hold an NFC tag against the back of your device",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun ReadingContent() {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "Reading tag...",
            style = MaterialTheme.typography.headlineSmall,
        )
    }
}

@Composable
private fun TagResultContent(tagInfo: TagInfo, onDismiss: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Tag Details",
                    style = MaterialTheme.typography.titleLarge,
                )
                Spacer(modifier = Modifier.height(12.dp))
                InfoRow("UID", tagInfo.uid)
                InfoRow("Technologies", tagInfo.techList.joinToString(", "))
                InfoRow("Writable", if (tagInfo.isWritable) "Yes" else "No")
                InfoRow("NDEF Formatable", if (tagInfo.isNdefFormatable) "Yes" else "No")
                if (tagInfo.maxSize > 0) {
                    InfoRow("Max NDEF Size", "${tagInfo.maxSize} bytes")
                    InfoRow("Used Size", "${tagInfo.usedSize} bytes")
                }
            }
        }

        if (tagInfo.ndefRecords.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "NDEF Records",
                style = MaterialTheme.typography.titleMedium,
            )
            Spacer(modifier = Modifier.height(8.dp))
            tagInfo.ndefRecords.forEachIndexed { index, record ->
                RecordCard(index = index, record = record)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Tap another tag to scan again",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun RecordCard(index: Int, record: NdefRecordModel) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            when (record) {
                is NdefRecordModel.TextRecord -> {
                    InfoRow("Record $index", "Text")
                    InfoRow("Language", record.languageCode)
                    InfoRow("Content", record.text)
                }
                is NdefRecordModel.UriRecord -> {
                    InfoRow("Record $index", "URI")
                    InfoRow("URL", record.uri)
                }
                is NdefRecordModel.MimeRecord -> {
                    InfoRow("Record $index", "MIME")
                    InfoRow("Type", record.mimeType)
                    InfoRow("Payload", record.payload.size.toString() + " bytes")
                }
                is NdefRecordModel.AarRecord -> {
                    InfoRow("Record $index", "App Launch")
                    InfoRow("Package", record.packageName)
                }
                is NdefRecordModel.UnknownRecord -> {
                    InfoRow("Record $index", "Unknown (TNF: ${record.tnf})")
                }
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(0.35f),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.weight(0.65f),
        )
    }
}

@Composable
private fun ErrorContent(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "Error",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.error,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
        )
    }
}
