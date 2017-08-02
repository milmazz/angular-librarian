'use strict';

const fs = require('fs');
const path = require('path');

exports.deleteFolder = (folder)  => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((file) => removePath(folder, file));
        fs.rmdirSync(folder);
    }
};

const removePath = (folder, file) => {
    const filepath = path.resolve(folder, file);

    if (fs.lstatSync(filepath).isDirectory()) {
        exports.deleteFolder(filepath);
    } else {
        fs.unlinkSync(filepath);
    }
};

exports.getTemplates = (rootDir, directory, filenames) => filenames.map((filename) => ({
    check: filename.check,
    destination: filename.destination || path.resolve(rootDir, filename.name),
    template: filename.blank ? undefined : path.resolve(directory, 'templates', filename.name),
    update: filename.update,
    overwrite: filename.overwrite
}));

/* istanbul ignore next */
exports.include = (file) => require(file);

exports.open = (file, json = false) => {
    let contents = fs.readFileSync(file, 'utf8');

    if (json) {
        contents = JSON.parse(contents);
    }

    return contents;
}

exports.resolver = {
    create() {
        const base = resolvePath(this.root(), arguments);

        return function() {
            return resolvePath(base, arguments);
        };
    },
    manual() {
        const args = Array.from(arguments);
        return resolvePath(args[0], args.slice(1));
    },
    root() {
        return resolvePath(process.cwd(), arguments);
    }
};

const resolvePath = (prefix, args) => {
    const argsList = Array.prototype.slice.call(args);

    return path.resolve.apply(path.resolve, [prefix].concat(argsList));
};
