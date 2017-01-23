package systems.rcd.enonic.datatoolbox;

import java.util.function.Supplier;

import systems.rcd.fwk.core.format.json.RcdJsonService;
import systems.rcd.fwk.core.format.json.data.RcdJsonArray;
import systems.rcd.fwk.core.format.json.data.RcdJsonObject;

import com.enonic.xp.repository.CreateRepositoryParams;
import com.enonic.xp.repository.DeleteRepositoryParams;
import com.enonic.xp.repository.Repository;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.repository.RepositoryService;
import com.enonic.xp.script.bean.BeanContext;

public class RcdRepositoryScriptBean
    extends RcdScriptBean
{
    private Supplier<RepositoryService> repositoryServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        repositoryServiceSupplier = context.getService( RepositoryService.class );
    }

    public String list()
    {
        return runSafely( () -> {
            final RcdJsonArray repositoryJsonArray = RcdJsonService.createJsonArray();

            for ( Repository repository : repositoryServiceSupplier.get().list() )
            {
                final RcdJsonObject snapshot = RcdJsonService.createJsonObject().
                    put( "name", repository.getId().toString() );
                repositoryJsonArray.add( snapshot );
            }
            return createSuccessResult( repositoryJsonArray );
        }, "Error while listing repositories" );
    }

    public String create( String repositoryName )
    {
        return runSafely( () -> {
            final CreateRepositoryParams createRepositoryParams = CreateRepositoryParams.create().
                repositoryId( RepositoryId.from( repositoryName ) ).
                build();

            repositoryServiceSupplier.get().
                createRepository( createRepositoryParams );

            return createSuccessResult();
        }, "Error while creating repository" );
    }

    public String delete( final String... repositoryNames )
    {
        return runSafely( () -> {
            for ( String repositoryId : repositoryNames )
            {
                final DeleteRepositoryParams deleteRepositoryParams = DeleteRepositoryParams.from( repositoryId );
                repositoryServiceSupplier.get().
                    deleteRepository( deleteRepositoryParams );

            }

            return createSuccessResult();
        }, "Error while deleting repositories" );
    }
}
