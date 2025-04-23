/**
 *                          __          _
 *   _ __ ___   ___   ___  / _| ___  __| |
 *  | '_ ` _ \ / _ \ / _ \| |_ / _ \/ _` |
 *  | | | | | | (_) | (_) |  _|  __/ (_| |
 *  |_| |_| |_|\___/ \___/|_|  \___|\__,_|
 *
 * VanMoof Data Backup Tool
 * Copyright (c) 2025 Moofed Contributors
 *
 * This tool is not affiliated with VanMoof B.V.
 * Use at your own risk.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import * as ed25519 from '@noble/ed25519';
import { VersionChecker } from './version-checker.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class Moofed {
    constructor() {
        this.baseUrl = 'https://my.vanmoof.com/api/v8';
        this.bikeApiUrl = 'https://bikeapi.production.vanmoof.cloud';
        this.apiKey = 'fcb38d47-f14b-30cf-843b-26283f6a5819';
        this.userAgent = 'VanMoof/20 CFNetwork/1404.0.5 Darwin/22.3.0';
        this.authToken = null;
        this.appToken = null;
        this.backupDir = path.join(process.cwd(), 'moofed_backup');
        this.versionChecker = new VersionChecker('lucasnijssen', 'moofed');
    }

    async authenticate(email, password) {
        try {
            const response = await axios.post(`${this.baseUrl}/authenticate`, null, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            this.authToken = response.data.token;
            return true;
        } catch (error) {
            console.error('Authentication failed:', error.response?.data || error.message);
            return false;
        }
    }

    async getAppToken() {
        try {
            const response = await axios.get('https://api.vanmoof-api.com/v8/getApplicationToken', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            this.appToken = response.data.token;
            return true;
        } catch (error) {
            console.error('Failed to get app token:', error.response?.data || error.message);
            return false;
        }
    }

    async getBikeData() {
        try {
            const response = await axios.get(`${this.baseUrl}/getCustomerData?includeBikeDetails`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Failed to get bike data:', error.response?.data || error.message);
            return null;
        }
    }

    async generateKeyPair() {
        const privKey = ed25519.utils.randomPrivateKey();
        const pubKey = await ed25519.getPublicKeyAsync(privKey);
        return {
            privateKey: Buffer.from(privKey).toString('base64'),
            publicKey: Buffer.from(pubKey).toString('base64')
        };
    }

    async createCertificate(bikeId, publicKey) {
        try {
            const response = await axios.post(
                `${this.bikeApiUrl}/bikes/${bikeId}/create_certificate`,
                { public_key: publicKey },
                {
                    headers: {
                        'Authorization': `Bearer ${this.appToken}`,
                        'Api-Key': this.apiKey,
                        'User-Agent': this.userAgent,
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to create certificate:', error.response?.data || error.message);
            return null;
        }
    }

    async backupBikeData(bikeData) {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `moofed_backup_${timestamp}.json`);

        fs.writeFileSync(backupFile, JSON.stringify(bikeData, null, 2));
        console.log(`\nBackup saved to: ${backupFile}`);
    }

    async processBike(bike) {
        console.log(`\nProcessing bike: ${bike.name}`);
        console.log(`Frame number: ${bike.frameNumber}`);

        if (bike.bleProfile === 'ELECTRIFIED_2022') {
            console.log('Bike is an SA5');
            const keyPair = await this.generateKeyPair();
            console.log('\nGenerated key pair:');
            console.log('Private key:', keyPair.privateKey);
            console.log('Public key:', keyPair.publicKey);

            const certificate = await this.createCertificate(bike.frameNumber, keyPair.publicKey);
            if (certificate) {
                console.log('\nCertificate generated successfully');
                return {
                    ...bike,
                    keyPair,
                    certificate
                };
            }
        } else {
            console.log('Not an SA5, skipping certificate generation');
        }

        return bike;
    }

    async run() {
        console.log('Welcome to Moofed - Your VanMoof Data Backup Tool\n');
        
        // Check for updates
        await this.versionChecker.checkVersion(process.env.npm_package_version || '1.0.0');

        const email = await new Promise(resolve => rl.question('Enter your VanMoof email: ', resolve));
        const password = await new Promise(resolve => rl.question('Enter your VanMoof password: ', resolve));

        console.log('\nAuthenticating...');
        if (!(await this.authenticate(email, password))) {
            rl.close();
            return;
        }

        console.log('Getting application token...');
        if (!(await this.getAppToken())) {
            rl.close();
            return;
        }

        console.log('Fetching bike data...');
        const bikeData = await this.getBikeData();
        if (!bikeData) {
            rl.close();
            return;
        }

        console.log('\nProcessing bikes...');
        const processedBikes = [];
        for (const bike of bikeData.bikeDetails) {
            const processedBike = await this.processBike(bike);
            processedBikes.push(processedBike);
        }

        const backupData = {
            user: {
                name: bikeData.name,
                email: bikeData.email,
                phone: bikeData.phone,
                country: bikeData.country
            },
            bikes: processedBikes,
            timestamp: new Date().toISOString()
        };

        await this.backupBikeData(backupData);
        rl.close();
    }
}

// Run the tool
new Moofed().run(); 