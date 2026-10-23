package io.github.hieudoanm.block.ui.block

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun BlockScreen(
    packageName: String,
    onGoHome: () -> Unit,
) {
    var appLabel by remember { mutableStateOf(packageName) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "\uD83D\uDEAB",
            fontSize = 64.sp,
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Stay Focused",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.onError,
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "$appLabel is blocked.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onError.copy(alpha = 0.8f),
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onGoHome,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.onError,
                contentColor = MaterialTheme.colorScheme.error,
            ),
        ) {
            Text("Go Home")
        }
    }
}
