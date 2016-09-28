package systems.rcd.enonic.datatoolbox;

import java.nio.file.Path;
import java.util.function.Supplier;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.export.ExportNodesParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.home.HomeDir;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.script.bean.BeanContext;

public class RcdDumpScriptBean
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
            final RcdJsonArray dumpsJsonArray = RcdJsonService.createJsonArray();

            final Path dumpDirectoryPath = getDumpDirectoryPath();
            if ( dumpDirectoryPath.toFile().exists() )
            {
                RcdFileService.listSubPaths( dumpDirectoryPath, dumpPath -> {
                    if ( dumpPath.toFile().isDirectory() )
                    {
                        final RcdJsonObject dump = RcdJsonService.createJsonObject().
                            put( "name", dumpPath.getFileName().toString() ).
                            put( "timestamp", dumpPath.toFile().lastModified() ).
                            put( "size", RcdFileService.getDirectorySize( dumpPath ) );
                        dumpsJsonArray.add( dump );
                    }
                } );
            }
            return createSuccessResult( dumpsJsonArray );
        }, "Error while listing dumps" );
    }

    public String create( final String dumpName )
    {
        return runSafely( () -> {
            create( dumpName, "cms-repo", "draft" );
            create( dumpName, "cms-repo", "master" );
            create( dumpName, "system-repo", "master" );
            return createSuccessResult();
        }, "Error while creating dump" );
    }

    private void create( final String dumpName, final String repositoryName, final String branchName )
    {
        ContextBuilder.from( ContextAccessor.current() ).
            repositoryId( RepositoryId.from( repositoryName ) ).
            branch( Branch.from( branchName ) ).
            build().
            callWith( () -> {
                final ExportNodesParams exportNodesParams = ExportNodesParams.create().
                    sourceNodePath( NodePath.ROOT ).
                    rootDirectory( getDumpDirectoryPath().resolve( dumpName ).toString() ).
                    targetDirectory(
                        getDumpDirectoryPath().resolve( dumpName ).resolve( repositoryName ).resolve( branchName ).toString() ).
                    dryRun( false ).
                    includeNodeIds( true ).
                    build();

                exportServiceSupplier.get().
                    exportNodes( exportNodesParams );
                return null;
            } );
    }

    public String delete( final String... dumpNames )
    {
        return runSafely( () -> {
            for ( String dumpName : dumpNames )
            {
                final Path dumpPath = getDumpDirectoryPath().resolve( dumpName );
                RcdFileService.deleteDirectory( dumpPath );
            }
            return createSuccessResult();
        }, "Error while deleting dumps" );
    }

    private Path getDumpDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/dump" );
    }
}
