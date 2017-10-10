package systems.rcd.enonic.datatoolbox;

import java.util.List;
import java.util.function.Supplier;

import org.apache.commons.lang.StringEscapeUtils;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.data.Property;
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

    public String list( final String repositoryName, final String branchName, final String path, final String field, final int start, final int count )
    {
        return runSafely( () -> {
            final RcdJsonObject result = RcdJsonService.createJsonObject();
            final RcdJsonArray fieldJsonArray = result.createArray( "hits" );

            final Node node = createContext( RepositoryId.from( repositoryName ), Branch.from( branchName ) ).
                callWith( () -> this.nodeServiceSupplier.get().getByPath( NodePath.create( path ).build() ) );
            
            result.put( "total", 0 );
            if ( node != null )
            {

                final PropertySet propertySet = field == null ? node.data().getRoot() : node.data().getSet( field );
                if ( propertySet != null )
                {
                    final List<Property> propertyList = (List<Property>) propertySet.getProperties();
                    result.put( "total", propertyList.size() );
                    propertyList.stream().skip( start ).limit( count ).forEach( property -> {
                        String value = "PropertySet".equals( property.getType().getName() ) ? "" : property.getValue().toString();
                        value = StringEscapeUtils.escapeHtml( value );
                        fieldJsonArray.createObject().
                            put( "name", property.getName() ).
                            put( "index", property.getIndex() ).
                            put( "value", value ).
                            put( "type", property.getType().toString() );
                    } );
                }
            }
            return createSuccessResult( result );
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
