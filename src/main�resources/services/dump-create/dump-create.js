exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var body = JSON.parse(req.body);
    var dumpName = body.dumpName;

    return {
        contentType: 'application/json',
        body: bean.create(dumpName)
    }
};