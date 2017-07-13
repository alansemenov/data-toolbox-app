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
import systems.rcd.fwk.core.format.properties.RcdPropertiesService;
import systems.rcd.fwk.core.io.file.RcdFileService;
import systems.rcd.fwk.core.io.file.RcdTextFileService;
import systems.rcd.fwk.core.script.js.RcdJavascriptService;
import systems.rcd.fwk.core.util.zip.RcdZipService;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.dump.DumpService;
import com.enonic.xp.dump.SystemDumpParams;
import com.enonic.xp.dump.SystemLoadParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.export.ImportNodesParams;
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

public class RcdDumpScriptBean
    extends RcdScriptBean
{
    private Supplier<ExportService> exportServiceSupplier;

    private Supplier<DumpService> dumpServiceSupplier;

    private Supplier<RepositoryService> repositoryServiceSupplier;

    private Supplier<NodeRepositoryService> nodeRepositoryServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        exportServiceSupplier = context.getService( ExportService.class );
        dumpServiceSupplier = context.getService( DumpService.class );
        repositoryServiceSupplier = context.getService( RepositoryService.class );
        nodeRepositoryServiceSupplier = context.getService( NodeRepositoryService.class );
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
                            put( "type", getDumpType( dumpPath ) ).
                            put( "version", getDumpVersion( dumpPath ) );
                        //put( "size", RcdFileService.getSize( dumpPath ) );
                        dumpsJsonArray.add( dump );
                    }
                } );
            }
            return createSuccessResult( dumpsJsonArray );
        }, "Error while listing dumps" );
    }

    private String getDumpType( final Path dumpPath )
    {
        try
        {
            if ( isExportDump( dumpPath ) )
            {
                return "export";
            }
            else if ( isVersionedDump( dumpPath ) )
            {
                return "versioned";
            }
        }
        catch ( Exception e )
        {
            LOGGER.error( "Error while reading dump type", e );
        }
        return "";
    }

    private String getDumpVersion( final Path dumpPath )
    {
        try
        {
            if ( isExportDump( dumpPath ) )
            {
                final String xpVersion = RcdPropertiesService.read( dumpPath.resolve( "export.properties" ) ).
                    get( "xp.version" );
                if ( xpVersion != null )
                {
                    return xpVersion;
                }
            }
            else if ( isVersionedDump( dumpPath ) )
            {
                final String dumpJsonContent = RcdTextFileService.readAsString( dumpPath.resolve( "dump.json" ) );
                final Object xpVersion = RcdJavascriptService.eval( "JSON.parse('" + dumpJsonContent + "').xpVersion" );
                if ( xpVersion instanceof String )
                {
                    return (String) xpVersion;
                }
            }
        }
        catch ( Exception e )
        {
            LOGGER.error( "Error while reading dump version", e );
        }
        return "";
    }

    public String create( final String dumpName )
    {
        return runSafely( () -> {
            final SystemDumpParams params = SystemDumpParams.create().
                dumpName( dumpName ).
                includeBinaries( true ).
                includeVersions( true ).
                maxAge( null ).
                maxVersions( null ).
                build();

            dumpServiceSupplier.get().dump( params );
            return createSuccessResult();
        }, "Error while creating dump" );
    }

    public String load( final String dumpName )
    {
        return runSafelyNoDependency( () -> {
            if ( isExportDump( dumpName ) )
            {
                loadUsingExportService( dumpName );
            }
            else
            {
                loadUsingSystemDumpService( dumpName );
            }
            return "{\"success\":true}";
        }, "Error while creating dump" );
    }

    private boolean isExportDump( final String dumpName )
    {
        final Path dumpPath = getDumpDirectoryPath().
            resolve( dumpName );
        return isExportDump( dumpPath );
    }

    private boolean isExportDump( final Path dumpPath )
    {
        return dumpPath.
            resolve( "export.properties" ).
            toFile().
            exists();
    }

    private boolean isVersionedDump( final Path dumpPath )
    {
        return dumpPath.
            resolve( "dump.json" ).
            toFile().
            exists();
    }

    private void loadUsingExportService( final String dumpName )
    {
        importSystemRepo( dumpName );
        this.repositoryServiceSupplier.get().invalidateAll();
        for ( Repository repository : this.repositoryServiceSupplier.get().list() )
        {
            initializeRepo( repository );
            importRepoBranches( repository, dumpName );
        }
    }

    private void loadUsingSystemDumpService( final String dumpName )
    {
        final SystemLoadParams systemLoadParams = SystemLoadParams.create().
            dumpName( dumpName ).
            includeVersions( true ).
            build();
        dumpServiceSupplier.get().load( systemLoadParams );
    }

    private void initializeRepo( final Repository repository )
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

    private void importSystemRepo( final String dumpName )
    {
        importRepoBranch( SystemConstants.SYSTEM_REPO.getId(), SystemConstants.BRANCH_SYSTEM, dumpName );
    }

    private void importRepoBranches( final Repository repository, final String dumpName )
    {
        for ( Branch branch : repository.getBranches() )
        {
            if ( !isSystemRepoMaster( repository, branch ) )
            {
                importRepoBranch( repository.getId(), branch, dumpName );
            }
        }
    }

    private boolean isSystemRepoMaster( final Repository repository, final Branch branch )
    {
        return SystemConstants.SYSTEM_REPO.equals( repository ) && SystemConstants.BRANCH_SYSTEM.equals( branch );
    }

    private void importRepoBranch( final RepositoryId repositoryId, final Branch branch, final String dumpName )
    {
        final Path sourcePath = getDumpDirectoryPath().
            resolve( dumpName ).
            resolve( repositoryId.toString() ).
            resolve( branch.getValue() );
        final ImportNodesParams importNodesParams = ImportNodesParams.create().
            source( VirtualFiles.from( sourcePath ) ).
            targetNodePath( NodePath.ROOT ).
            dryRun( false ).
            includeNodeIds( true ).
            includePermissions( true ).
            build();
        createContext( repositoryId, branch ).callWith( () -> exportServiceSupplier.get().importNodes( importNodesParams ) );
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

            Predicate<ZipEntry> filter = zipEntry -> !zipEntry.getName().startsWith( "__MACOSX/" );
            RcdZipService.unzip( exportArchivePath, getDumpDirectoryPath(), filter );
        }
    }

    private Path getDumpDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/dump" );
    }

    private Context createContext( final RepositoryId repositoryId, final Branch branch )
    {
        return ContextBuilder.from( ContextAccessor.current() ).
            repositoryId( repositoryId ).
            branch( branch ).
            build();
    }
}
