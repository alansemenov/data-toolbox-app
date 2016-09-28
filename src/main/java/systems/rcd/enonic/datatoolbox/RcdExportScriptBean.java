package systems.rcd.enonic.datatoolbox;

import java.nio.file.Path;
import java.util.function.Supplier;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;

import com.enonic.xp.export.ExportNodesParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.export.ImportNodesParams;
import com.enonic.xp.home.HomeDir;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.vfs.VirtualFiles;

public class RcdExportScriptBean
    extends RcdScriptBean
{
    private Supplier<ExportService> exportServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        exportServiceSupplier = context.getService( ExportService.class );
    }

    public String list()
    {
        return runSafely( () -> {
            final RcdJsonArray exportJsonArray = RcdJsonService.createJsonArray();

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
                        exportJsonArray.add( export );
                    }
                } );
            }
            return createSuccessResult( exportJsonArray );
        }, "Error while listing exports" );
    }

    public String create( String contentPath, String exportName )
    {
        return runSafely( () -> {
            final NodePath nodePath = NodePath.create( "/content" + contentPath ).build();
            final ExportNodesParams exportNodesParams = ExportNodesParams.create().
                sourceNodePath( nodePath ).
                targetDirectory( getExportDirectoryPath().resolve( exportName ).toString() ).
                dryRun( false ).
                includeNodeIds( true ).
                build();

            exportServiceSupplier.get().
                exportNodes( exportNodesParams );
            return createSuccessResult();
        }, "Error while creating export" );
    }

    public String load( String contentPath, String[] exportNames )
    {
        return runSafely( () -> {
            final NodePath nodePath = NodePath.create( "/content" + contentPath ).build();
            for ( String exportName : exportNames )
            {
                load( nodePath, exportName );
            }
            return createSuccessResult();
        }, "Error while loading export" );
    }

    public String delete( final String... exportNames )
    {
        return runSafely( () -> {
            for ( String exportName : exportNames )
            {
                final Path exportPath = getExportDirectoryPath().resolve( exportName );
                RcdFileService.deleteDirectory( exportPath );
            }
            return createSuccessResult();
        }, "Error while deleting export" );
    }

    private void load( NodePath nodePath, String exportName )
    {
        final ImportNodesParams importNodesParams = ImportNodesParams.create().
            targetNodePath( nodePath ).
            source( VirtualFiles.from( getExportDirectoryPath().resolve( exportName ) ) ).
            dryRun( false ).
            includeNodeIds( true ).
            includePermissions( true ).
            build();

        exportServiceSupplier.get().
            importNodes( importNodesParams );
    }

    private Path getExportDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/export" );
    }
}
