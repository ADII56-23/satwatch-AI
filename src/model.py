import torch
import torch.nn as nn
import torchvision.models as models

class SiameseEncoder(nn.Module):
    def __init__(self, backbone='resnet50', pretrained=True):
        super(SiameseEncoder, self).__init__()
        # Load a pretrained backbone
        if backbone == 'resnet50':
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            base_model = models.resnet50(weights=weights)
            self.features = nn.Sequential(*list(base_model.children())[:-2]) # Remove FC and avgpool
            self.out_channels = 2048
        else:
            raise NotImplementedError(f"Backbone {backbone} not implemented")

    def forward(self, x):
        return self.features(x)

class ChangeDetectionModel(nn.Module):
    def __init__(self):
        super(ChangeDetectionModel, self).__init__()
        self.encoder = SiameseEncoder()
        
        # Decoder / Segmentation Head
        # Simple upsampling for demonstration; in production use generic U-Net decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(2048 * 2, 512, kernel_size=2, stride=2),
            nn.ReLU(),
            nn.ConvTranspose2d(512, 128, kernel_size=16, stride=16), # Upsample to original size (roughly)
            nn.Conv2d(128, 1, kernel_size=1)
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, t1, t2):
        # Extract features from both images (Siamese weights)
        f1 = self.encoder(t1)
        f2 = self.encoder(t2)
        
        # Feature Fusion (Concatenation)
        # Alternatively: abs(f1 - f2)
        features = torch.cat([f1, f2], dim=1)
        
        # Decode to change map
        out = self.decoder(features)
        return self.sigmoid(out)

if __name__ == '__main__':
    # Test tensor shapes
    model = ChangeDetectionModel()
    t1 = torch.randn(1, 3, 256, 256)
    t2 = torch.randn(1, 3, 256, 256)
    output = model(t1, t2)
    print(f"Output shape: {output.shape}")
