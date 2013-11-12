module.exports = function (project, errors) {
    console.error(errors.explainErrors(true));
    if (errors.hasErrors()) {
        process.exit(1);
    }
};
