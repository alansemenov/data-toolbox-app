function createBranchesRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addChild(new RcdGoogleMaterialIconArea('help', displayHelp).init().setTooltip('Help'));

    const tableCard = new RcdMaterialTableCard('Branches').init().
        addColumn('Branch name').
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createBranch).init().setTooltip('Create a branch'), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteBranches).init().setTooltip('Delete selected branches', RcdMaterialTooltipAlignment.RIGHT), {min: 1});
    const layout = new RcdMaterialLayout().init().
        addChild(tableCard);

    return {
        state: 'branches',
        callback: (main) => {
            main.addChild(breadcrumbsLayout).addChild(layout);
            app.setTitle(RcdHistoryRouter.getParameters().repo);
            refreshBreadcrumbs();
            retrieveBranches();
        }
    };

    function retrieveBranches() {
        const infoDialog = showInfoDialog('Retrieving branch list...');
        return $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/repository-get',
            data: JSON.stringify({repositoryName: RcdHistoryRouter.getParameters().repo}),
            contentType: 'application/json; charset=utf-8'
        }).done(function (result) {
            tableCard.deleteRows();
            
            const parentRow = tableCard.createRow({selectable:false}).
                addCell('..', {tooltip: {text:'Display repositories'}}).
                addClass('rcd-clickable').
                addClickListener(() => {
                    RcdHistoryRouter.setState('repositories');
                });
            
            if (handleResultError(result)) {
                result.success.branches.sort((branch1, branch2) => branch1 - branch2).
                    forEach((branch) => {
                        const row = tableCard.createRow().
                            addCell(branch, {tooltip: {text:'Display branch root node'}}).
                            setAttribute('branch', branch).
                            addClass('rcd-clickable').
                            addClickListener(() => {
                                RcdHistoryRouter.setState('nodes?repo=' + RcdHistoryRouter.getParameters().repo + '&branch=' + branch);
                            });
                        row.checkbox.addClickListener((event) => event.stopPropagation());
                    });
            }
        }).fail(handleAjaxError).always(() => {
            infoDialog.close();
        });
    }

    function createBranch() {
        const defaultBranchName = 'branch-' + toLocalDateTimeFormat(new Date(), '-', '-').toLowerCase();
        showInputDialog({
            title: 'Create branch',
            label: 'Branch name',
            placeholder: defaultBranchName,
            value: defaultBranchName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateBranch(value || defaultBranchName)
        });
    }

    function doCreateBranch(branchName) {
        const infoDialog = showInfoDialog('Creating branch...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/branch-create',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchName: branchName || ('branch-' + toLocalDateTimeFormat(new Date(), '-', '-')).toLowerCase()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveBranches();
        });
    }

    function deleteBranches() {
        showConfirmationDialog('Delete selected branches?', 'DELETE', doDeleteBranches);
    }

    function doDeleteBranches() {
        const infoDialog = showInfoDialog('Deleting selected branches...');
        const branchNames = tableCard.getSelectedRows().map((row) => row.attributes['branch']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/branch-delete',
            data: JSON.stringify({
                repositoryName: RcdHistoryRouter.getParameters().repo,
                branchNames: branchNames
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveBranches();
        });
    }

    function refreshBreadcrumbs() {
        breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init(),
                new RcdMaterialBreadcrumb('Data Tree', () => RcdHistoryRouter.setState('repositories')).init(),
                new RcdMaterialBreadcrumb(RcdHistoryRouter.getParameters().repo).init()]);
    }

    function displayHelp() {
        const definition = 'A branch is a set of data in a repository.  All repositories have a default branch called master. ' +
                           'Any number of branches can be added to facilitate your data. ' +
                           'For example, the cms-repo repository contains two branches:' +
                           '"draft" containing the content as seen in the Content Studio and ' +
                           '"master" containing the published content served by the portal.<br/>' +
                           'See <a class="rcd-material-link" href="http://xp.readthedocs.io/en/6.10/developer/node-domain/branch.html">Branch</a> for more information.';

        const viewDefinition = 'The view lists in a table all the branches of the current repository. Click on a row to display its root node.';

        new HelpDialog('Branches', [definition, viewDefinition]).
            init().
            addActionDefinition({iconName: 'add_circle', definition: 'Create a branch with default settings'}).
            addActionDefinition({iconName: 'delete', definition: 'Delete the selected branches.'}).
            open();
    }
}
