function createPresentationRoute() {

    class ViewSummary extends RcdDivElement {
        constructor(state, iconFileName, text) {
            super();
            this.state = state;
            this.icon = new RcdImageIcon(config.assetsUrl + '/icons/views/' + iconFileName).init();
            this.text = new RcdPElement().init().setText(text);
        }

        init() {
            return super.init().
                addClass('view-summary').
                addChild(this.icon).
                addChild(this.text).addClickListener(() => RcdHistoryRouter.setState(this.state));
        }
    }

    const exportsSectionContent = new RcdPElement().init().
        setText('A node export is a serialization of a given content/node. ' +
                'This makes node exports well suited for transferring a specific content to another installation. ' +
                'Warning: The current export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.');

    const image = new RcdImageIcon(config.assetsUrl + '/icons/application.svg').init();
    const subTitle = new RcdH2Element().init().
        setText('A web interface to visualize and manage your Enonic XP data');

    const repositoriesViewSummary = new ViewSummary('repositories', 'repositories.svg',
        'Browse and manage your <b>repositories</b>, branches and nodes.').init();
    const snapshotsViewSummary = new ViewSummary('snapshots', 'snapshots.svg',
        'Record the state of your indexes at specific times. Rollback to these <b>snapshots</b> when needed.').init();
    const exportsViewSummary = new ViewSummary('exports', 'exports.svg', 'Manage your <b>node exports</b>.').init();
    const dumpsViewSummary = new ViewSummary('dumps', 'exports.svg', 'Generate and manage your <b>system dumps</b>.').init();
    const viewSummaries = new RcdDivElement().init().
        addClass('view-summaries').
        addChild(repositoriesViewSummary).
        addChild(snapshotsViewSummary).
        addChild(exportsViewSummary).
        addChild(dumpsViewSummary);

    const layout = new RcdMaterialLayout().init().
        addClass('presentation-view').
        addChild(image).
        addChild(subTitle).
        addChild(viewSummaries);

    return {
        callback: (main) => {
            main.addChild(layout);
            app.setTitle('Data Toolbox');
        }
    };
}
