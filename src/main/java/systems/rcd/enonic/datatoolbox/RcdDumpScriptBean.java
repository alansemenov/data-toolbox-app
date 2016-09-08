package systems.rcd.enonic.datatoolbox;

import java.nio.file.Path;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;

import com.enonic.xp.home.HomeDir;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class RcdDumpScriptBean
    implements ScriptBean
{
    @Override
    public void initialize( final BeanContext context )
    {

    }

    public String list()
    {
        final RcdJsonArray result = RcdJsonService.createJsonArray();

        final Path dumpDirectoryPath = HomeDir.get().
            toFile().
            toPath().
            resolve( "data/dump" );

        if ( dumpDirectoryPath.toFile().exists() )
        {
            RcdFileService.listSubPaths( dumpDirectoryPath, dumpPath -> {
                if ( dumpPath.toFile().isDirectory() )
                {
                    final RcdJsonObject dump = RcdJsonService.createJsonObject().
                        put( "name", dumpPath.getFileName().toString() ).
                        put( "timestamp", dumpPath.toFile().lastModified() );
                    result.add( dump );
                }
            } );
        }
        return RcdJsonService.toString( result );
    }
}
