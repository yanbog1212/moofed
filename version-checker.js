/**
 *                          __          _
 *   _ __ ___   ___   ___  / _| ___  __| |
 *  | '_ ` _ \ / _ \ / _ \| |_ / _ \/ _` |
 *  | | | | | | (_) | (_) |  _|  __/ (_| |
 *  |_| |_| |_|\___/ \___/|_|  \___|\__,_|
 *
 * VanMoof Data Backup Tool - Version Checker
 * Copyright (c) 2025 Moofed Contributors
 *
 * This tool is not affiliated with VanMoof B.V.
 * Use at your own risk.
 */

import axios from 'axios';

export class VersionChecker {
    constructor(repoOwner, repoName) {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
    }

    async checkVersion(currentVersion) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`);
            const latestVersion = response.data.tag_name.replace('v', '');

            if (latestVersion !== currentVersion) {
                if (this.compareVersions(currentVersion, latestVersion) > 0) {
                    console.log('\n⚠️  You are running a development version of Moofed!');
                    console.log(`Current version: ${currentVersion}`);
                    console.log(`Latest stable version: ${latestVersion}`);
                    console.log('This version may be unstable or contain experimental features.\n');
                } else {
                    console.log('\n⚠️  A new version of Moofed is available!');
                    console.log(`Current version: ${currentVersion}`);
                    console.log(`Latest version: ${latestVersion}`);
                    console.log('Please update to the latest version for the best experience.');
                }
            }
        } catch (error) {
            console.error('Failed to check for updates:', error.message);
        }
    }

    compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        
        return 0;
    }
} 