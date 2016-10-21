package systems.rcd.enonic.datatoolbox;


import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.osgi.service.component.annotations.Component;

import systems.rcd.fwk.core.util.zip.RcdZipService;

import com.enonic.xp.home.HomeDir;
import com.enonic.xp.jaxrs.JaxRsComponent;
import com.enonic.xp.security.RoleKeys;

@Path("/admin/rest/datatoolbox")
@RolesAllowed(RoleKeys.ADMIN_ID)
@Component(immediate = true)
public final class DtbRsComponent
    implements JaxRsComponent
{
    @POST
    @Path("dump/download")
    @Consumes("application/x-www-form-urlencoded")
    public Response download( @FormParam("dumpNames") String dumpNamesFormParam )
        throws Exception
    {
        final String[] dumpNames = dumpNamesFormParam.split( "," );
        final java.nio.file.Path dumpArchivePath = Files.createTempFile( "dump-archive", ".zip" );
        final java.nio.file.Path[] dumpPaths = Arrays.stream( dumpNames ).
            map( dumpName -> getDumpDirectoryPath().resolve( dumpName ) ).
            toArray( size -> new java.nio.file.Path[size] );
        System.out.println( "Creating dump archive: " + dumpArchivePath );
        RcdZipService.zip( dumpArchivePath, dumpPaths );
        final Response response =
            Response.ok( new TemporaryFileInputStream( dumpArchivePath.toFile() ), MediaType.APPLICATION_OCTET_STREAM ).
                header( "Content-Disposition", "attachment; filename=\"" + dumpArchivePath.getFileName().toString() + "\"" ).
                build();
        return response;
    }

    private java.nio.file.Path getDumpDirectoryPath()
    {
        return HomeDir.get().
            toFile().
            toPath().
            resolve( "data/dump" );
    }

    private class TemporaryFileInputStream
        extends FileInputStream
    {

        private final File file;

        public TemporaryFileInputStream( File file )
            throws FileNotFoundException
        {
            super( file );
            this.file = file;
        }

        @Override
        public void close()
            throws IOException
        {
            super.close();
            file.delete();
        }
    }

}

