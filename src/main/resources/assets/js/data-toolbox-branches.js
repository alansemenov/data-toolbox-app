function createBranchesRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init();

    const tableCard = new RcdMaterialTableCard('Branches').init().
        addColumn('Branch name').
        addIconArea(new RcdGoogleMaterialIconArea('add_circle', createBranch).init().setTooltip('Create a branch', undefined,
            RcdMaterialTooltipAlignment.RIGHT), {max: 0}).
        addIconArea(new RcdGoogleMaterialIconArea('delete', deleteBranches).init().setTooltip('Delete selected branches', undefined,
            RcdMaterialTooltipAlignment.RIGHT), {min: 1});
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
            if (handleResultError(result)) {
                result.success.branches.sort((branch1, branch2) => branch1 - branch2).
                    forEach((branch) => {
                        const row = tableCard.createRow().
                            addCell(branch).
                            setAttribute('branch', branch).
                            addClass('rcd-clickable').
                            addClickListener(() => {
                                RcdHistoryRouter.setState('nodes?repo=' +
                                                          RcdHistoryRouter.getParameters().repo + '&branch=' +
                                                          branch + '&start=0&count=50');
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
        new RcdMaterialInputDialog({
            title: 'Create branch',
            label: 'Branch name',
            placeholder: defaultBranchName,
            value: defaultBranchName,
            confirmationLabel: 'CREATE',
            callback: (value) => doCreateBranch(value || defaultBranchName)
        }).init().open();
    }

    function doCreateBranch(branchName) {
        const infoDialog = showInfoDialog('Creating branch...');
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/branch-create',
            data: JSON.stringify({
                branchName: branchName || ('branch-' + toLocalDateTimeFormat(new Date(), '-', '-')).toLowerCase()
            }),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveBranches();
        });
    }

    function deleteBranches() {
        showConfirmationDialog("Delete selected branches?", doDeleteBranches);
    }

    function doDeleteBranches() {
        const infoDialog = showInfoDialog("Deleting selected branches...");
        const branchNames = tableCard.getSelectedRows().map((row) => row.attributes['branch']);
        $.ajax({
            method: 'POST',
            url: config.servicesUrl + '/branch-delete',
            data: JSON.stringify({branchNames: branchNames}),
            contentType: 'application/json; charset=utf-8'
        }).done(handleResultError).fail(handleAjaxError).always(() => {
            infoDialog.close();
            retrieveBranches();
        });
    }

    function refreshBreadcrumbs() {
        breadcrumbsLayout.
            setBreadcrumbs([new RcdMaterialBreadcrumb('Data Toolbox', () => RcdHistoryRouter.setState()).init(),
                new RcdMaterialBreadcrumb('Repositories', () => RcdHistoryRouter.setState('repositories')).init(),
                new RcdMaterialBreadcrumb(RcdHistoryRouter.getParameters().repo).init()]);
    }
}
