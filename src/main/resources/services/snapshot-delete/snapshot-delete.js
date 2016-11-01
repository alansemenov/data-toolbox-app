exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdSnapshotScriptBean');
    var snapshotNames = JSON.parse(req.body).snapshotNames;

    return {
        contentType: 'application/json',
        body: bean.delete(snapshotNames)
    }
};