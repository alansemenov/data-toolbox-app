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
import systems.rcd.fwk.core.format.json.data.RcdJsonValue;
import systems.rcd.fwk.core.io.file.RcdFileService;
import systems.rcd.fwk.core.util.zip.RcdZipService;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.export.ExportNodesParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.export.ImportNodesParams;
import com.enonic.xp.export.NodeExportResult;
import com.enonic.xp.export.NodeImportResult;
import com.enonic.xp.home.HomeDir;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.repository.CreateRepositoryParams;
import com.enonic.xp.repository.NodeRepositoryService;
import com.enonic.xp.repository.Repository;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.repository.RepositoryService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.security.SystemConstants;
import com.enonic.xp.vfs.VirtualFiles;

public class RcdExportScriptBean
    extends RcdScriptBean
{
    private Supplier<ExportService> exportServiceSupplier;

    private Supplier<RepositoryService> repositoryServiceSupplier;

    private Supplier<NodeRepositoryService> nodeRepositoryServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        exportServiceSupplier = context.getService( ExportService.class );
        repositoryServiceSupplier = context.getService( RepositoryService.class );
        nodeRepositoryServiceSupplier = context.getService( NodeRepositoryService.class );
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
                includeVersions( true ).
                build();

            final NodeExportResult nodeExportResult = createContext( repositoryName, branchName ).
                callWith( () -> exportServiceSupplier.get().exportNodes( exportNodesParams ) );
            final RcdJsonValue result = convertNodeExportResultToJson( nodeExportResult );
            return createSuccessResult( result );
        }, "Error while creating export" );
    }

    private RcdJsonValue convertNodeExportResultToJson( final NodeExportResult nodeExportResult )
    {
        final RcdJsonObject result = RcdJsonService.createJsonObject();

        result.put( "exportedNodeCount", nodeExportResult.getExportedNodes().getSize() );
        result.put( "exportedBinaryCount", nodeExportResult.getExportedBinaries().size() );
        result.put( "errorCount", nodeExportResult.getExportErrors().size() );

        final RcdJsonArray exportedNodesResult = result.createArray( "exportedNodes" );
        final RcdJsonArray exportedBinariesResult = result.createArray( "exportedBinaries" );
        final RcdJsonArray errorsResult = result.createArray( "errors" );

        limitedAddAll( nodeExportResult.getExportedNodes().stream(), exportedNodesResult, nodePath -> nodePath.toString() );
        limitedAddAll( nodeExportResult.getExportedBinaries().stream(), exportedBinariesResult, binary -> (String) binary );
        limitedAddAll( nodeExportResult.getExportErrors().stream(), errorsResult, error -> error.toString() );

        return result;
    }

    public String load( final String[] exportNames, final String repositoryName, final String branchName, final String nodePathString )
    {
        return runSafely( () -> {
            final RcdJsonObject results = RcdJsonService.createJsonObject();
            final NodePath nodePath = NodePath.create( nodePathString ).build();
            createContext( repositoryName, branchName ).runWith( () -> {
                for ( String exportName : exportNames )
                {
                    final NodeImportResult nodeImportResult = load( nodePath, exportName );
                    final RcdJsonValue result = convertNodeImportResultToJson( nodeImportResult );
                    results.put( exportName, result );

                }
                if ( SystemConstants.SYSTEM_REPO.getId().toString().equals( repositoryName ) &&
                    SystemConstants.BRANCH_SYSTEM.getValue().equals( branchName ) )
                {
                    initializeStoredRepositories();
                }
            } );

            return createSuccessResult( results );
        }, "Error while loading export" );
    }

    private RcdJsonValue convertNodeImportResultToJson( final NodeImportResult nodeImportResult )
    {
        final RcdJsonObject result = RcdJsonService.createJsonObject();

        result.put( "addedNodeCount", nodeImportResult.getAddedNodes().getSize() );
        result.put( "updatedNodeCount", nodeImportResult.getUpdateNodes().getSize() );
        result.put( "importedBinaryCount", nodeImportResult.getExportedBinaries().size() );
        result.put( "errorCount", nodeImportResult.getImportErrors().size() );

        final RcdJsonArray addedNodesResult = result.createArray( "addedNodes" );
        final RcdJsonArray updatedNodesResult = result.createArray( "updatedNodes" );
        final RcdJsonArray importedBinariesResult = result.createArray( "importedBinaries" );
        final RcdJsonArray errorsResult = result.createArray( "errors" );

        limitedAddAll( nodeImportResult.getAddedNodes().stream(), addedNodesResult, nodePath -> nodePath.toString() );
        limitedAddAll( nodeImportResult.getUpdateNodes().stream(), updatedNodesResult, nodePath -> nodePath.toString() );
        limitedAddAll( nodeImportResult.getExportedBinaries().stream(), importedBinariesResult, binary -> (String) binary );
        limitedAddAll( nodeImportResult.getImportErrors().stream(), errorsResult,
                       error -> ( (NodeImportResult.ImportError) error ).getMessage() + " - " +
                           ( (NodeImportResult.ImportError) error ).getException().toString() );

        return result;
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

    private NodeImportResult load( NodePath nodePath, String exportName )
    {
        final ImportNodesParams importNodesParams = ImportNodesParams.create().
            targetNodePath( nodePath ).
            source( VirtualFiles.from( getExportDirectoryPath().resolve( exportName ) ) ).
            dryRun( false ).
            includeNodeIds( true ).
            includePermissions( true ).
            build();

        return exportServiceSupplier.get().
            importNodes( importNodesParams );
    }

    private void initializeStoredRepositories()
    {
        repositoryServiceSupplier.get().invalidateAll();
        for ( Repository repository : repositoryServiceSupplier.get().list() )
        {
            if ( !nodeRepositoryServiceSupplier.get().isInitialized( repository.getId() ) )
            {
                final CreateRepositoryParams createRepositoryParams = CreateRepositoryParams.create().
                    repositoryId( repository.getId() ).
                    repositorySettings( repository.getSettings() ).
                    build();
                nodeRepositoryServiceSupplier.get().create( createRepositoryParams );
            }
        }
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
