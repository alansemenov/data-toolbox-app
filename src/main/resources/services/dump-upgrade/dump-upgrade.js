var taskLib = require('/lib/xp/task');

exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var dumpName = JSON.parse(req.body).dumpName;

    var taskId = taskLib.submit({
        description: 'Dump upgrade',
        task: function () {
            taskLib.progress({info: 'Upgrading dump...'});
            taskLib.progress({info: bean.upgrade(dumpName)});
        }
    });

    return {
        contentType: 'application/json',
        body: {taskId: taskId}
    }
};