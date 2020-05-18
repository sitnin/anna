#!/usr/bin/env node

/*******************************************************************************
 * Copyright (c) Sitnin.com, 2020.
 ******************************************************************************/

import readPkgUp from "read-pkg-up";
import cli from "cli";
import path from "path";
import { inspect } from "util";

(async () => {
    try {
        const pkgLoaded = await readPkgUp({cwd: __dirname});

        if (!pkgLoaded) throw new Error("Cannot load package.json file");

        const pkg = pkgLoaded.packageJson;
        const skelDir = path.join(path.dirname(pkgLoaded.path), "skel");

        cli.setApp(pkg.name, pkg.version);
        cli.enable("help", "version", "status");

        const opts = await cli.parse({
            name: ["n", "Target name (file will be named after this)", "string"],
            tpl: ["t", "Template to use", "string", "app"],
            skel: ["k", "Skel directory", "string", skelDir],
        });

        if (!opts.name || !opts.tpl) {
            throw new Error("Name SHOULD be set");
        } else {
            cli.debug(inspect(opts, {depth: 3}));
        }
    } catch (e) {
        cli.error(e.message || e);
        process.exit(1);
    }

    process.exit(0);
})();
