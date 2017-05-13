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

    const snapshotsSectionContent = new RcdPElement().init().
        setText('A snapshot is a record of your Enonic XP indexes at a particular point in time. ' +
                'Your first snapshot will be a complete copy of your indexes, but all subsequent snapshots will save the delta between the existing snapshots and the current state.' +
                'This makes snapshots optimized for repetitive saves and allow to quickly rollback to a previous state in one click. It is also used, in addition to blobs backup, for backing up your data. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/backup.html#backing-up-indexes">Backing up indexes</a> for more information.');

    const branchesSectionContent = new RcdPElement().init().
        setText('A branch is a set of data in a repository. ' +
                'All repositories have a default branch called master. ' +
                'Any number of branches could be added to facilitate your data. ' +
                'For example, the cms-repo repository contains two branches: ' +
                '"draft" containing the content as seen in the Content Studio and ' +
                '"master" containing the published content served by the portal. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/branch.html">Branch</a> for more information.');

    const nodesSectionContent = new RcdPElement().init().
        setText('A Node represents a single storable entity of data. ' +
                'It can be compared to a row in sql or a document in document oriented storage models. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/nodes.html">Nodes</a> for more information. ' +
                'The nodes are represented here in a tree structure. ' +
                'While this solution is adapted to repositories like cms-repo or system-repo, ' +
                'it may be problematic for repositories not following a tree structure or for nodes with too many children. ' +
                'If you need a tool to browse these repositories or if you need browsing based on queries, we recommend using the tool <a href="https://market.enonic.com/vendors/runar-myklebust/repoxplorer">repoXPlorer</a>.');


    const image = new RcdImageIcon(config.assetsUrl + '/icons/application.svg').init();
    const subTitle = new RcdH2Element().init().
        setText('A web interface to visualize and manage your Enonic XP data');

    const repositoriesViewSummary = new ViewSummary('repositories', 'repositories.svg',
        'Browse and manage your <b>repositories</b>, branches and nodes.').init();
    const snapshotsViewSummary = new ViewSummary('snapshots', 'snapshots.svg',
        'Record the state of your indexes at specific times. Rollback to these <b>snapshots</b> when needed.').init();
    const exportsViewSummary = new ViewSummary('exports', 'exports.svg', 'Manage your <b>node exports</b>.').init();
    const dumpsViewSummary = new ViewSummary('dumps', 'dumps.svg', 'Generate and manage your <b>system dumps</b>.').init();
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
