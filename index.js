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

class ProgressIndicator {
    constructor(total, message = 'Processing') {
        this.total = total;
        this.current = 0;
        this.message = message;
        this.startTime = Date.now();
        this.interval = null;
    }

    start() {
        process.stdout.write(`${this.message}... `);
        this.interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            process.stdout.write(`\r${this.message}... ${this.current}/${this.total} (${elapsed}s) `);
        }, 1000);
    }

    increment() {
        this.current++;
    }

    stop() {
        clearInterval(this.interval);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        process.stdout.write(`\r${this.message}... Done! (${elapsed}s)\n`);
    }
}

class MoofedError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'MoofedError';
        this.code = code;
        this.details = details;
    }
}

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

    async handleError(error, context) {
        if (error instanceof MoofedError) {
            console.error(`\nError (${error.code}): ${error.message}`);
            if (error.details) console.error('Details:', error.details);
        } else if (error.response) {
            console.error(`\nAPI Error (${error.response.status}):`);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            console.error('\nNetwork Error: No response received from server');
        } else {
            console.error(`\nError in ${context}:`, error.message);
        }
        return false;
    }

    async authenticate(email, password) {
        const progress = new ProgressIndicator(1, 'Authenticating');
        progress.start();
        
        try {
            if (!email || !password) {
                throw new MoofedError('Email and password are required', 'AUTH_001');
            }

            const response = await axios.post(`${this.baseUrl}/authenticate`, null, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            
            this.authToken = response.data.token;
            progress.stop();
            return true;
        } catch (error) {
            progress.stop();
            return this.handleError(error, 'authentication');
        }
    }

    async getAppToken() {
        const progress = new ProgressIndicator(1, 'Getting application token');
        progress.start();
        
        try {
            if (!this.authToken) {
                throw new MoofedError('Authentication token is missing', 'TOKEN_001');
            }

            const response = await axios.get('https://api.vanmoof-api.com/v8/getApplicationToken', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            
            this.appToken = response.data.token;
            progress.stop();
            return true;
        } catch (error) {
            progress.stop();
            return this.handleError(error, 'getting application token');
        }
    }

    async getBikeData() {
        const progress = new ProgressIndicator(1, 'Fetching bike data');
        progress.start();
        
        try {
            if (!this.authToken) {
                throw new MoofedError('Authentication token is missing', 'BIKE_001');
            }

            const response = await axios.get(`${this.baseUrl}/getCustomerData?includeBikeDetails`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Api-Key': this.apiKey,
                    'User-Agent': this.userAgent,
                }
            });
            
            progress.stop();
            return response.data.data;
        } catch (error) {
            progress.stop();
            this.handleError(error, 'fetching bike data');
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

    async processBike(bike) {
        const progress = new ProgressIndicator(2, `Processing bike ${bike.name}`);
        progress.start();
        
        console.log(`\nFrame number: ${bike.frameNumber}`);

        if (bike.bleProfile === 'ELECTRIFIED_2022') {
            console.log('Bike is an SA5');
            const keyPair = await this.generateKeyPair();
            progress.increment();
            
            console.log('\nGenerated key pair:');
            console.log('Private key:', keyPair.privateKey);
            console.log('Public key:', keyPair.publicKey);

            const certificate = await this.createCertificate(bike.frameNumber, keyPair.publicKey);
            progress.increment();
            
            if (certificate) {
                console.log('\nCertificate generated successfully');
                progress.stop();
                return {
                    ...bike,
                    keyPair,
                    certificate
                };
            }
        } else {
            console.log('Not an SA5, skipping certificate generation');
            progress.stop();
        }

        return bike;
    }

    async backupBikeData(bikeData) {
        const progress = new ProgressIndicator(1, 'Creating backup');
        progress.start();
        
        try {
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `moofed_backup_${timestamp}.json`);

            fs.writeFileSync(backupFile, JSON.stringify(bikeData, null, 2));
            progress.stop();
            console.log(`\nBackup saved to: ${backupFile}`);
        } catch (error) {
            progress.stop();
            this.handleError(error, 'creating backup');
        }
    }

    async run() {
        console.log('Welcome to Moofed - Your VanMoof Data Backup Tool\n');
        
        try {
            // Check for updates
            await this.versionChecker.checkVersion(process.env.npm_package_version || '1.0.0');

            const email = await new Promise(resolve => rl.question('Enter your VanMoof email: ', resolve));
            const password = await new Promise(resolve => rl.question('Enter your VanMoof password: ', resolve));

            if (!(await this.authenticate(email, password))) {
                throw new MoofedError('Authentication failed', 'RUN_001');
            }

            if (!(await this.getAppToken())) {
                throw new MoofedError('Failed to get application token', 'RUN_002');
            }

            const bikeData = await this.getBikeData();
            if (!bikeData) {
                throw new MoofedError('Failed to get bike data', 'RUN_003');
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
        } catch (error) {
            this.handleError(error, 'running the application');
        } finally {
            rl.close();
        }
    }
}

// Run the tool
new Moofed().run(); 