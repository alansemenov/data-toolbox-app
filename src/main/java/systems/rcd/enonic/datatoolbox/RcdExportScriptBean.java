package systems.rcd.enonic.datatoolbox;

import java.nio.file.Path;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;

import com.enonic.xp.home.HomeDir;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class RcdExportScriptBean
    implements ScriptBean
{
    @Override
    public void initialize( final BeanContext context )
    {
    }

    public String list()
    {
        final RcdJsonArray result = RcdJsonService.createJsonArray();
        final Path exportDirectoryPath = getExportDirectoryPath();

        if ( exportDirectoryPath.toFile().exists() )
        {
            RcdFileService.listSubPaths( exportDirectoryPath, exportPath -> {
                if ( exportPath.toFile().isDirectory() )
                {
                    final RcdJsonObject export = RcdJsonService.createJsonObject().
                        put( "name", exportPath.getFileName().toString() ).
                        put( "timestamp", exportPath.toFile().lastModified() ).
                        put( "size", RcdFileService.getDirectorySize( exportPath ) );
                    result.add( export );
                }
            } );
        }
        return RcdJsonService.toString( result );
    }

    public RcdJsonObject delete( final String... exportNames )
    {
        try
        {
            for ( String exportName : exportNames )
            {
                final Path exportPath = getExportDirectoryPath().resolve( exportName );
                RcdFileService.deleteDirectory( exportPath );
            }
            return RcdJsonService.createJsonObject().put( "success", true );

        }
        catch ( Exception e )
        {
            return RcdJsonService.createJsonObject().put( "success", false );
        }
    }

    private Path getExportDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/export" );
    }
}
