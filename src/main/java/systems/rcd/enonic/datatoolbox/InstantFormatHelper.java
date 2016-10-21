package systems.rcd.enonic.datatoolbox;


import java.time.Instant;
import java.time.format.DateTimeFormatter;

public class InstantFormatHelper
{
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern( "yyyyMMddHHmmss" );

    public String format( final Instant instant )
    {
        return FORMATTER.format( instant );
    }
}
