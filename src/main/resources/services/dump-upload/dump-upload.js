var portalLib = require('/lib/xp/portal');

exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var fileName = portalLib.getMultipartItem("uploadFile", 0).fileName;
    var uploadFileStream = portalLib.getMultipartStream("uploadFile", 0);
    bean.upload(fileName, uploadFileStream);

    return {
        contentType: 'application/json',
        body: {}
    }
};