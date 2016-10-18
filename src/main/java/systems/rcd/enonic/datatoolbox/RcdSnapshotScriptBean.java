package systems.rcd.enonic.datatoolbox;

import java.util.function.Supplier;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;

import com.enonic.xp.node.NodeService;
import com.enonic.xp.node.SnapshotParams;
import com.enonic.xp.node.SnapshotResult;
import com.enonic.xp.script.bean.BeanContext;

public class RcdSnapshotScriptBean
    extends RcdScriptBean
{
    private Supplier<NodeService> nodeServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        nodeServiceSupplier = context.getService( NodeService.class );
    }

    public String list()
    {
        return runSafely( () -> {
            final RcdJsonArray snapshotJsonArray = RcdJsonService.createJsonArray();

            for ( SnapshotResult snapshotResult : nodeServiceSupplier.get().listSnapshots() )
            {
                final RcdJsonObject snapshot = RcdJsonService.createJsonObject().
                    put( "name", snapshotResult.getName() ).
                    put( "timestamp", snapshotResult.getTimestamp().toEpochMilli() );
                snapshotJsonArray.add( snapshot );
            }
            return createSuccessResult( snapshotJsonArray );
        }, "Error while listing exports" );
    }

    public String create( String snapshotName )
    {
        return runSafely( () -> {

            final SnapshotParams snapshotParams = SnapshotParams.create().
                snapshotName( snapshotName.toLowerCase() ).
                build();

            nodeServiceSupplier.get().
                snapshot( snapshotParams );

            return createSuccessResult();
        }, "Error while creating export" );
    }
}
