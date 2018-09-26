package systems.rcd.enonic.datatoolbox;

import java.util.List;
import java.util.function.Supplier;

import org.apache.commons.lang.StringEscapeUtils;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.node.Node;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;

import com.enonic.xp.script.bean.BeanContext;

public class RcdIndexDocumentScriptBean
    extends RcdScriptBean
{
    private Supplier<Node> nodeSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        nodeSupplier = context.getService( Node.class );
    }

    public String get( final String repositoryName, final String branchName, final String type, final String id, final String versionKey )
    {
        return runSafely( () -> {

            final String indexName = generateIndexName( type, repositoryName );
            final String indexTypeName = generateIndexTypeName( type, branchName );
            final String indexDocumentId = generateIndexDocumentId( type, id, branchName, versionKey );
            final GetRequest getRequest = new GetRequest( indexName, indexTypeName, indexDocumentId );
            if("branch".equals( type )) {
                getRequest.parent( generateIndexDocumentId( "version", id, branchName, versionKey ) );
            }
            final GetResponse getResponse = nodeSupplier.get().
                client().
                get( getRequest ).
                actionGet( 4000 );

            if ( !getResponse.isExists() )
            {
                return createErrorResult( "Index document not found" );
            }

            final RcdJsonObject source = RcdJsonService.createJsonObject();
            getResponse.getSource().entrySet().forEach( sourceEntry -> {
                final Object fieldValues = sourceEntry.getValue();
                if ( fieldValues instanceof Iterable )
                {
                    final RcdJsonArray field = source.createArray( sourceEntry.getKey() );
                    ( (List) fieldValues ).forEach( fieldValue -> {
                        final String escapedValue = StringEscapeUtils.escapeHtml( fieldValue.toString() );
                        field.add( escapedValue );
                    } );
                }
            } );

            final RcdJsonObject result = RcdJsonService.createJsonObject().
                put( "_index", getResponse.getIndex() ).
                put( "_type", getResponse.getType() ).
                put( "_id", getResponse.getId() ).
                put( "_version", getResponse.getVersion() ).
                put( "_source", source );
            return createSuccessResult( result );
        }, "Error while retrieving index document" );
    }

    private String generateIndexName( final String type, final String repositoryName )
    {
        switch ( type )
        {
            case "search":
                return "search-" + repositoryName;
            case "branch":
            case "version":
                return "storage-" + repositoryName;
            default:
                return null;
        }
    }

    private String generateIndexTypeName( final String type, final String branchName )
    {
        switch ( type )
        {
            case "search":
                return branchName;
            case "branch":
            case "version":
                return type;
            default:
                return null;
        }
    }

    private String generateIndexDocumentId( final String type, final String id, final String branchName, final String versionKey )
    {
        switch ( type )
        {
            case "search":
                return id;
            case "branch":
                return id + "_" + branchName;
            case "version":
                return id + "_" + versionKey;
            default:
                return null;
        }
    }
}
