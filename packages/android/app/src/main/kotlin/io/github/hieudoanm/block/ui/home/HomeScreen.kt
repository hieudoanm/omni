package io.github.hieudoanm.block.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun HomeScreen(
    onNavigateToAppList: () -> Unit,
    onNavigateToSettings: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Focus Blocker",
            style = MaterialTheme.typography.headlineLarge,
        )

        StatusCard(
            label = "Accessibility",
            value = if (state.accessibilityEnabled) "Enabled" else "Disabled",
            isActive = state.accessibilityEnabled,
        )

        StatusCard(
            label = "Blocking",
            value = if (state.blockingEnabled) "Enabled" else "Disabled",
            isActive = state.blockingEnabled,
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            onClick = onNavigateToAppList,
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Blocked Apps",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    text = "${state.blockedAppCount} apps selected",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Statistics",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    text = "Today\n${state.minutesSaved} minutes saved",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Button(
                onClick = onNavigateToAppList,
                modifier = Modifier.weight(1f),
            ) {
                Text("Manage Apps")
            }
            Button(
                onClick = onNavigateToSettings,
                modifier = Modifier.weight(1f),
            ) {
                Text("Settings")
            }
        }
    }
}

@Composable
private fun StatusCard(
    label: String,
    value: String,
    isActive: Boolean,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isActive) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.errorContainer
            },
        ),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = if (isActive) {
                    MaterialTheme.colorScheme.onPrimaryContainer
                } else {
                    MaterialTheme.colorScheme.onErrorContainer
                },
            )
        }
    }
}
