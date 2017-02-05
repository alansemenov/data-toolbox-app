package systems.rcd.enonic.datatoolbox;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.zip.ZipEntry;

import com.google.common.io.ByteSource;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;
import systems.rcd.fwk.core.io.file.RcdFileService;
import systems.rcd.fwk.core.util.zip.RcdZipService;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
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
                            put( "timestamp", exportPath.toFile().lastModified() );
                        //put( "size", RcdFileService.getSize( exportPath ) );
                        exportJsonArray.add( export );
                    }
                } );
            }
            return createSuccessResult( exportJsonArray );
        }, "Error while listing exports" );
    }

    public String create( final String repositoryName, final String branchName, final String nodePath, final String exportName )
    {
        return runSafely( () -> {
            final ExportNodesParams exportNodesParams = ExportNodesParams.create().
                sourceNodePath( NodePath.create( nodePath ).build() ).
                targetDirectory( getExportDirectoryPath().resolve( exportName ).toString() ).
                dryRun( false ).
                includeNodeIds( true ).
                build();

            createContext( repositoryName, branchName ).
                runWith( () -> exportServiceSupplier.get().exportNodes( exportNodesParams ) );
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
                RcdFileService.delete( exportPath );
            }
            return createSuccessResult();
        }, "Error while deleting export" );
    }

    public TemporaryFileByteSource download( final String... exportNames )
        throws IOException
    {
        final java.nio.file.Path[] exportPaths = Arrays.stream( exportNames ).
            map( exportName -> getExportDirectoryPath().resolve( exportName ) ).
            toArray( size -> new java.nio.file.Path[size] );

        final String exportArchiveName = ( exportNames.length == 1 ? exportNames[0] : "export-archive" ) + "-";
        final java.nio.file.Path exportArchivePath = Files.createTempFile( exportArchiveName, ".zip" );
        RcdZipService.zip( exportArchivePath, exportPaths );
        return new TemporaryFileByteSource( exportArchivePath.toFile() );
    }


    public void upload( String filename, ByteSource exportArchiveByteSource )
        throws IOException
    {
        final java.nio.file.Path exportArchivePath = Files.createTempFile( filename, ".tmp" );
        try (TemporaryFileOutputStream tmp = new TemporaryFileOutputStream( exportArchivePath.toFile() ))
        {
            exportArchiveByteSource.copyTo( tmp );
            Predicate<ZipEntry> filter = zipEntry -> !zipEntry.getName().startsWith( "__MACOSX/" );
            RcdZipService.unzip( exportArchivePath, getExportDirectoryPath(), filter );
        }
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


    private Context createContext( final String repositoryName, final String branch )
    {
        return ContextBuilder.from( ContextAccessor.current() ).
            repositoryId( RepositoryId.from( repositoryName ) ).
            branch( Branch.from( branch ) ).
            build();
    }
}
