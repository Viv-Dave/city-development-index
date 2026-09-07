from typing import Optional, List
import numpy as np

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    nn = None

if TORCH_AVAILABLE:
    class PM25LSTMNet(nn.Module):
        """
        PyTorch LSTM Architecture for Air-Quality Forecasting:
        Input sequence (24 hours) -> LSTM(64) -> Dropout(0.2) -> LSTM(32) -> Dense(16) -> Dense(1)
        """
        def __init__(self, input_dim: int = 1, hidden_dim_1: int = 64, hidden_dim_2: int = 32, fc_dim: int = 16, dropout: float = 0.2):
            super().__init__()
            self.lstm1 = nn.LSTM(input_dim, hidden_dim_1, batch_first=True)
            self.dropout = nn.Dropout(dropout)
            self.lstm2 = nn.LSTM(hidden_dim_1, hidden_dim_2, batch_first=True)
            self.fc1 = nn.Linear(hidden_dim_2, fc_dim)
            self.relu = nn.ReLU()
            self.fc2 = nn.Linear(fc_dim, 1)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            # x shape: [batch_size, seq_len, input_dim]
            out, _ = self.lstm1(x)
            out = self.dropout(out)
            out, _ = self.lstm2(out)
            # Take last time-step hidden state
            last_step = out[:, -1, :]
            dense1 = self.relu(self.fc1(last_step))
            prediction = self.fc2(dense1)
            return prediction
else:
    class PM25LSTMNet:
        """Fallback definition when PyTorch is not loaded."""
        def __init__(self, *args, **kwargs):
            pass
