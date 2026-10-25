package com.smartlivestock.backend.membership;

import com.smartlivestock.backend.farm.entity.Farm;
import com.smartlivestock.backend.farm.entity.FarmStatus;
import com.smartlivestock.backend.farm.entity.LivestockType;
import com.smartlivestock.backend.farm.repository.FarmRepository;
import com.smartlivestock.backend.membership.entity.FarmMembership;
import com.smartlivestock.backend.membership.entity.MembershipRole;
import com.smartlivestock.backend.membership.entity.MembershipStatus;
import com.smartlivestock.backend.membership.repository.FarmMembershipRepository;
import com.smartlivestock.backend.user.entity.AccountStatus;
import com.smartlivestock.backend.user.entity.User;
import com.smartlivestock.backend.user.entity.UserRole;
import com.smartlivestock.backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FarmMembershipRepositoryTest {

    @Autowired
    private FarmMembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Test
    @DisplayName("Should prevent duplicate membership records for same farm and user")
    void shouldPreventDuplicateMembership() {
        User user = new User();
        user.setName("Vet Patil");
        user.setEmail("vet@dairy.com");
        user.setPasswordHash("hash123");
        user.setRole(UserRole.VETERINARIAN);
        user.setStatus(AccountStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        Farm farm = new Farm();
        farm.setName("Valley Farm");
        farm.setLivestockType(LivestockType.DAIRY);
        farm.setStatus(FarmStatus.ACTIVE);
        Farm savedFarm = farmRepository.save(farm);

        FarmMembership m1 = new FarmMembership();
        m1.setFarm(savedFarm);
        m1.setUser(savedUser);
        m1.setRole(MembershipRole.VETERINARIAN);
        m1.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.saveAndFlush(m1);

        FarmMembership m2 = new FarmMembership();
        m2.setFarm(savedFarm);
        m2.setUser(savedUser);
        m2.setRole(MembershipRole.VETERINARIAN);
        m2.setStatus(MembershipStatus.ACTIVE);

        assertThrows(DataIntegrityViolationException.class, () -> membershipRepository.saveAndFlush(m2));
    }

    @Test
    @DisplayName("Should return active member user IDs and exclude inactive members without Hibernate exception")
    void testShouldFindActiveUserIdsByFarmId() {
        Farm farm = new Farm();
        farm.setName("Green Pastures");
        farm.setLivestockType(LivestockType.DAIRY);
        farm.setStatus(FarmStatus.ACTIVE);
        Farm savedFarm = farmRepository.save(farm);

        User activeUser = new User();
        activeUser.setName("Farmer Ramesh");
        activeUser.setEmail("ramesh@farm.com");
        activeUser.setPasswordHash("pass123");
        activeUser.setRole(UserRole.FARM_OWNER);
        activeUser.setStatus(AccountStatus.ACTIVE);
        User savedActiveUser = userRepository.save(activeUser);

        User inactiveUser = new User();
        inactiveUser.setName("Ex-Worker Suresh");
        inactiveUser.setEmail("suresh@farm.com");
        inactiveUser.setPasswordHash("pass123");
        inactiveUser.setRole(UserRole.VETERINARIAN);
        inactiveUser.setStatus(AccountStatus.ACTIVE);
        User savedInactiveUser = userRepository.save(inactiveUser);

        FarmMembership activeMembership = new FarmMembership();
        activeMembership.setFarm(savedFarm);
        activeMembership.setUser(savedActiveUser);
        activeMembership.setRole(MembershipRole.FARM_OWNER);
        activeMembership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(activeMembership);

        FarmMembership inactiveMembership = new FarmMembership();
        inactiveMembership.setFarm(savedFarm);
        inactiveMembership.setUser(savedInactiveUser);
        inactiveMembership.setRole(MembershipRole.VETERINARIAN);
        inactiveMembership.setStatus(MembershipStatus.SUSPENDED);
        membershipRepository.save(inactiveMembership);

        java.util.List<java.util.UUID> activeUserIds = membershipRepository.findUserIdsByFarmId(savedFarm.getId());

        assertNotNull(activeUserIds);
        assertEquals(1, activeUserIds.size());
        assertTrue(activeUserIds.contains(savedActiveUser.getId()));
        assertFalse(activeUserIds.contains(savedInactiveUser.getId()));
    }
}
