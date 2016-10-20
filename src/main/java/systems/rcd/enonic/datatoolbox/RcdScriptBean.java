package systems.rcd.enonic.datatoolbox;

import java.util.function.Supplier;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonValue;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class RcdScriptBean
    implements ScriptBean
{
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
            return RcdJsonService.toString( createErrorResult( errorMessage ) );
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
}