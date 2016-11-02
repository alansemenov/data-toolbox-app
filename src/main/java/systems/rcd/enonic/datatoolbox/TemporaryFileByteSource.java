package systems.rcd.enonic.datatoolbox;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import com.google.common.io.ByteSource;

/**
 * Created by gri on 02/11/16.
 */
public class TemporaryFileByteSource
    extends ByteSource
{
    private File file;

    public TemporaryFileByteSource( File file )
    {
        this.file = file;
    }

    @Override
    public InputStream openStream()
        throws IOException
    {
        return new TemporaryFileInputStream( file );
    }
}
