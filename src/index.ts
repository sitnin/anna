/*******************************************************************************
 * Copyright (c) Sitnin.com, 2020.
 ******************************************************************************/

import { ConfDirReader } from "json-confdir";

interface DatabaseConnectionConfig {
    host: string;
    port?: number;
    user?: string;
    password?: string;
}

interface LoggingConfig {
    kind: "console" | "file" | "syslog";
    target?: string;
}

export interface ApplicationConfig {
    debug?: boolean;
    logs: false | LoggingConfig;
    // db?: string | DatabaseConnectionConfig;
}

const defaultAppConfig = {
    debug: false,
    logs: false,
};

export abstract class Application {
    private _config: ApplicationConfig;
    private _datatbases: Map<string, any> = new Map();

    get cfg(): ApplicationConfig {
        return this._config;
    }

    get debug(): boolean {
        return (typeof this.cfg === "object") && !!this.cfg.debug;
    }

    get dbs(): Map<string, any> {
        return this._datatbases;
    }

    abstract async main(): Promise<void>;

    async loadConfiguration(dirs: string | string[]): Promise<any> {
        const confDirs = typeof dirs === "string" ? [dirs] : dirs;
        const reader = new ConfDirReader(true);
        const config = await reader.load(...confDirs);
        return Object.assign({}, defaultAppConfig, config);
    }

    async initDatabases(): Promise<void> {
        // Intentionally left blank
    }

    async init(): Promise<void> {
        await this.initDatabases();
    }

    async run(dirs: string | string[]): Promise<void> {
        try {
            this._config = await this.loadConfiguration(dirs);
            await this.init();
            await this.main();
            process.exit(0);
        } catch (e) {
            let msg = e.message || e.toString();
            if (this.debug) msg = e.stack || msg;
            console.error(msg);
            process.exit(1);
        }
    }
}
