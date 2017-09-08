package systems.rcd.enonic.datatoolbox;

import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonValue;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class RcdScriptBean
    implements ScriptBean
{
    protected final Logger LOGGER = LoggerFactory.getLogger( RcdScriptBean.class );

    protected static final long RESULT_DETAILS_COUNT = 100;

    @Override
    public void initialize( final BeanContext context )
    {
    }

    protected String runSafely( final Supplier<RcdJsonValue> supplier, final String errorMessage )
    {
        try
        {
            return RcdJsonService.toString( supplier.get() );
        }
        catch ( Exception e )
        {
            LOGGER.error( errorMessage, e );
            return RcdJsonService.toString( createErrorResult( errorMessage ) );
        }
    }

    protected String runSafelyNoDependency( final Supplier<String> supplier, final String errorMessage )
    {
        try
        {
            return supplier.get();
        }
        catch ( Exception e )
        {
            LOGGER.error( errorMessage, e );
            return "{\"error\":\"" + errorMessage + "\"}";
        }
    }

    protected RcdJsonValue createErrorResult( final String errorMessage )
    {
        return RcdJsonService.createJsonObject().
            put( "error", errorMessage );
    }

    protected RcdJsonValue createSuccessResult()
    {
        return RcdJsonService.createJsonObject().
            put( "success", true );
    }

    protected RcdJsonValue createSuccessResult( final RcdJsonValue successValue )
    {
        final RcdJsonValue success = RcdJsonService.createJsonObject().
            put( "success", successValue );
        return success;
    }

    protected void limitedAddAll( final Stream<? extends Object> from, final RcdJsonArray to, final Function<Object, String> converter )
    {
        from.limit( RESULT_DETAILS_COUNT ).
            forEach( error -> to.add( converter.apply( error ) ) );
        if ( to.size() == RESULT_DETAILS_COUNT )
        {
            to.add( "..." );
        }
    }
}
