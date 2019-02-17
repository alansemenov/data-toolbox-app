package systems.rcd.enonic.datatoolbox;

import java.util.function.Supplier;

import org.elasticsearch.node.Node;

import com.google.common.base.Charsets;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;

import com.enonic.xp.blob.BlobKey;
import com.enonic.xp.blob.BlobRecord;
import com.enonic.xp.blob.BlobStore;
import com.enonic.xp.blob.Segment;
import com.enonic.xp.blob.SegmentLevel;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.repository.RepositorySegmentUtils;
import com.enonic.xp.script.bean.BeanContext;

public class RcdBlobScriptBean
    extends RcdScriptBean
{
    private Supplier<Node> nodeSupplier;

    private Supplier<BlobStore> blobStoreSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        super.initialize( context );
        nodeSupplier = context.getService( Node.class );
        blobStoreSupplier = context.getService( BlobStore.class );
    }

    public String get( final String repositoryName, final String branchName, final String id, final String versionKey, final String type,
                       final String blobKeyString )
    {
        try
        {
            final RepositoryId repositoryId = RepositoryId.from( repositoryName );
            final SegmentLevel blobSegmentLevel = SegmentLevel.from( type );
            final BlobKey blobKey =
                blobKeyString == null ? getBlobKey( repositoryName, branchName, id, versionKey, type ) : BlobKey.from( blobKeyString );
            final Segment segment = RepositorySegmentUtils.toSegment( repositoryId, blobSegmentLevel );
            final BlobRecord blobRecord = blobStoreSupplier.get().
                getRecord( segment, blobKey );
            final String blobContent = blobRecord.getBytes().
                asCharSource( Charsets.UTF_8 ).
                read();
            return "{\"success\":" + blobContent + "}";
        }
        catch ( Exception e )
        {
            final String errorMessage = "Error while retrieving blob";
            LOGGER.error( errorMessage, e );
            return RcdJsonService.toString( createErrorResult( errorMessage ) );
        }
    }

    private BlobKey getBlobKey( final String repositoryName, final String branchName, final String id, final String versionKey,
                                final String blobType )
    {
        final RcdJsonObject document = RcdIndexDocumentCommand.create().
            node( nodeSupplier.get() ).
            repositoryName( repositoryName ).
            branchName( branchName ).
            type( "branch" ).
            id( id ).
            versionKey( versionKey ).
            build().
            get();

        return BlobKey.from( getBlobKey( document, blobType ) );
    }

    private String getBlobKey( final RcdJsonObject document, final String blobType )
    {
        final RcdJsonObject source = document.getObject( "_source" );
        switch ( blobType )
        {
            case "node":
                final RcdJsonArray jsonArray =
                    source.hasKey( "nodeblobkey" ) ? source.getArray( "nodeblobkey" ) : source.getArray( "blobkey" );
                return jsonArray.getString( 0 );
            case "index":
                return source.getArray( "indexblobkey" ).getString( 0 );
            case "access":
                return source.getArray( "accessblobkey" ).getString( 0 );
        }
        return null;
    }

}
