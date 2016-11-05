package systems.rcd.enonic.datatoolbox;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.function.Supplier;

import com.google.common.io.ByteSource;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;
import systems.rcd.fwk.core.util.zip.RcdZipService;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.export.ExportNodesParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.export.ImportNodesParams;
import com.enonic.xp.home.HomeDir;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.vfs.VirtualFiles;

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
                            put( "timestamp", dumpPath.toFile().lastModified() );
                        //put( "size", RcdFileService.getSize( dumpPath ) );
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

    public String load( final String[] dumpNames )
    {
        return runSafely( () -> {
            for ( final String dumpName : dumpNames )
            {
                load( dumpName );
            }
            return createSuccessResult();
        }, "Error while creating dump" );
    }

    private void load( final String dumpName )
    {
        load( dumpName, "cms-repo", "draft" );
        load( dumpName, "cms-repo", "master" );
        load( dumpName, "system-repo", "master" );
    }

    private void load( final String dumpName, final String repositoryName, final String branchName )
    {
        ContextBuilder.from( ContextAccessor.current() ).
            repositoryId( RepositoryId.from( repositoryName ) ).
            branch( Branch.from( branchName ) ).
            build().
            callWith( () -> {
                final ImportNodesParams importNodesParams = ImportNodesParams.create().
                    targetNodePath( NodePath.ROOT ).
                    source(
                        VirtualFiles.from( getDumpDirectoryPath().resolve( dumpName ).resolve( repositoryName ).resolve( branchName ) ) ).
                    dryRun( false ).
                    includeNodeIds( true ).
                    includePermissions( true ).
                    build();

                exportServiceSupplier.get().
                    importNodes( importNodesParams );
                return null;
            } );
    }

    public String delete( final String... dumpNames )
    {
        return runSafely( () -> {
            for ( String dumpName : dumpNames )
            {
                final Path dumpPath = getDumpDirectoryPath().resolve( dumpName );
                RcdFileService.delete( dumpPath );
            }
            return createSuccessResult();
        }, "Error while deleting dumps" );
    }

    public TemporaryFileByteSource download( final String... dumpNames )
        throws IOException
    {
        final java.nio.file.Path[] dumpPaths = Arrays.stream( dumpNames ).
            map( dumpName -> getDumpDirectoryPath().resolve( dumpName ) ).
            toArray( size -> new java.nio.file.Path[size] );

        final String dumpArchiveName = ( dumpNames.length == 1 ? dumpNames[0] : "dump-archive" ) + "-";
        final java.nio.file.Path dumpArchivePath = Files.createTempFile( dumpArchiveName, ".zip" );
        RcdZipService.zip( dumpArchivePath, dumpPaths );

        return new TemporaryFileByteSource( dumpArchivePath.toFile() );
    }

    public void upload( String filename, ByteSource dumpArchiveByteSource )
        throws IOException
    {
        final java.nio.file.Path exportArchivePath = Files.createTempFile( filename, ".tmp" );
        try (TemporaryFileOutputStream tmp = new TemporaryFileOutputStream( exportArchivePath.toFile() ))
        {
            dumpArchiveByteSource.copyTo( tmp );
            RcdZipService.unzip( exportArchivePath, getDumpDirectoryPath() );
        }
    }

    private Path getDumpDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/dump" );
    }
}
