</br>
<p align="center">
    <img src="assets/logo.png" alt="logo" width="30%">
</p>

<p align="center">
    <h1 align="center">
        Moofed
    </h1>
</p>

<p align="center">
    A Node.js tool to backup your <a href="https://vanmoof.com">VanMoof</a> bike data and certificates 🚲
</p>

<p align="center">
   <a href="https://github.com/lucasnijssen/moofed/actions/workflows/node.js.yml">
       <img src="https://github.com/lucasnijssen/moofed/actions/workflows/node.js.yml/badge.svg" alt="Build Status">
   </a>
   <a href="https://opensource.org/licenses/MIT">
       <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
   </a>
   <a href="https://nodejs.org">
       <img src="https://img.shields.io/badge/Node.js-20.x-green.svg" alt="Node.js Version">
   </a>
</p>

> [!IMPORTANT]
> Moofed is not an official tool of [VanMoof B.V](https://vanmoof.com). This Node.js tool makes certain features of the bike accessible which may be illegal to use in certain jurisdictions. As this tool hasn&apos;t reached an official stable version some features are not yet available or may not working as expected.

## ✨ Features

- 🔐 Secure authentication with VanMoof servers
- 📦 Automatic backup of all your bike data
- 🔑 Generation of new key pairs for SA5 bikes
- 📝 Creation of new certificates for your bikes
- 📁 Organized backup files with timestamps
- 🔄 Support for multiple bikes per account

## 🚀 Quick Start

1. Clone this repository:
```bash
git clone https://github.com/lucasnijssen/moofed.git
cd moofed
```

2. Install dependencies:
```bash
npm install
```

3. Run the tool:
```bash
npm start
```

4. Follow the prompts to:
   - Enter your VanMoof credentials
   - Moofed generates and saves certificates for all your bikes

## 📁 Backup Structure

Your backups are saved in the `moofed_backup` directory with the following structure:

```json
{
  "user": {
    "name": "Your Name",
    "email": "your@email.com",
    "phone": "+1234567890",
    "country": "Your Country"
  },
  "bikes": [
    {
      "name": "Bike Name",
      "frameNumber": "SVSCB200127OA",
      "keyPair": {
        "privateKey": "base64_encoded_private_key",
        "publicKey": "base64_encoded_public_key"
      },
      "certificate": {
        // Certificate data
      }
    }
  ],
  "timestamp": "2024-03-21T12:34:56.789Z"
}
```

## 🔒 Security

- Your credentials are only used for authentication and are not stored
- All sensitive data is saved locally in your backup files
- Private keys are generated securely using the `@noble/ed25519` library

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the VanMoof community&apos;s resilience
- Built with Node.js and love ❤️

## ⚠️ Disclaimer

This tool is provided as-is, without any warranty. Use it at your own risk. The developers are not responsible for any issues that may arise from using this tool.

## Credits

Special thanks to the following projects for their inspiration and technical insights:
- [vanmoof-encryption-key-exporter](https://github.com/grossartig/vanmoof-encryption-key-exporter) 
- [VanMoofKit](https://github.com/SvenTiigi/VanMoofKit)
- [pymoof](https://github.com/quantsini/pymoof)