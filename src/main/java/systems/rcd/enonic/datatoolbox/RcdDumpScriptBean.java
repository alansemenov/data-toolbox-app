package systems.rcd.enonic.datatoolbox;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class RcdDumpScriptBean
    implements ScriptBean
{
    @Override
    public void initialize( final BeanContext context )
    {

    }

    public String list()
    {
        return "[\"a\"]";
    }
}
