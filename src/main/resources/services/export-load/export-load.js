var taskLib = require('/lib/xp/task');

exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var body = JSON.parse(req.body);
    var contentPath = body.contentPath;
    var exportNames = body.exportNames;

    var taskId = taskLib.submit({
        description: 'Content import',
        task: function () {
            taskLib.progress({info: 'Importing contents...'});
            taskLib.progress({info: bean.load(exportNames, 'cms-repo', 'draft', '/content' + contentPath)});
        }
    });

    return {
        contentType: 'application/json',
        body: {taskId: taskId}
    }
};