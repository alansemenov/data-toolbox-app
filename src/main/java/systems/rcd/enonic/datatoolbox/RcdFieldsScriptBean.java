package systems.rcd.enonic.datatoolbox;

import java.util.function.Supplier;

import org.apache.commons.lang.StringEscapeUtils;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.node.Node;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodeService;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.script.bean.BeanContext;

public class RcdFieldsScriptBean
    extends RcdScriptBean
{
    private Supplier<NodeService> nodeServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        nodeServiceSupplier = context.getService( NodeService.class );
    }

    public String list( final String repositoryName, final String branchName, final String path, final String field )
    {
        return runSafely( () -> {
            final RcdJsonArray fieldJsonArray = RcdJsonService.createJsonArray();

            final Node node = createContext( RepositoryId.from( repositoryName ), Branch.from( branchName ) ).
                callWith( () -> this.nodeServiceSupplier.get().getByPath( NodePath.create( path ).build() ) );

            if ( node != null )
            {

                final PropertySet propertySet = field == null ? node.data().getRoot() : node.data().getSet( field );
                if ( propertySet != null )
                {
                    propertySet.getProperties().forEach( property -> {
                        String value = property.getValue().toString();
                        value = StringEscapeUtils.escapeHtml( value );
                        value = StringEscapeUtils.escapeJavaScript( value );
                        fieldJsonArray.createObject().
                            put( "name", property.getName() ).
                            put( "index", property.getIndex() ).
                            put( "value", value).
                            put( "type", property.getType().toString() );
                    } );
                }
            }

            return createSuccessResult( fieldJsonArray );
        }, "Error while listing fields" );
    }

    private Context createContext( final RepositoryId repositoryId, final Branch branch )
    {
        return ContextBuilder.from( ContextAccessor.current() ).
            repositoryId( repositoryId ).
            branch( branch ).
            build();
    }

}
